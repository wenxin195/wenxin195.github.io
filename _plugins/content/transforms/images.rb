# frozen_string_literal: true

require_relative "tree"
require "uri"

module Jekyll
  module Content
    module Transforms
      # Reserve local image geometry; authors can explicitly prioritize an LCP image.
      module Images
        module_function

        def apply!(frag, site: nil)
          frag.css("img").each do |img|
            next if Tree.verbatim?(img)
            add_dimensions!(img, site) if site
            img["decoding"] = "async" if img["decoding"].to_s.empty?
            img["loading"] = "lazy" if img["loading"].to_s.empty? && img["fetchpriority"] != "high"
          end
        end

        # Read local headers only: never fetch remote images during a build.
        def add_dimensions!(img, site)
          src = img["src"].to_s.split(/[?#]/).first.to_s
          return if src.empty? || src.match?(%r{\A(?:[a-z]+:|//)}i)
          base = site.config["baseurl"].to_s.sub(%r{/$}, "")
          src = src.delete_prefix(base) if !base.empty? && src.start_with?("#{base}/")
          root = File.realpath(site.source)
          file = File.expand_path(URI::DEFAULT_PARSER.unescape(src).sub(%r{\A/}, ""), root)
          return unless file.start_with?(root + File::SEPARATOR) && File.file?(file)
          return unless File.realpath(file).start_with?(root + File::SEPARATOR)
          @sizes ||= {}
          size = (@sizes[[file, File.mtime(file)]] ||= image_size(file))
          return unless size && size.all? { |n| n.to_f.positive? }
          w, h = size
          width, height = img["width"].to_i, img["height"].to_i
          if width.positive? && !height.positive?
            img["height"] = [(width * h.to_f / w).round, 1].max.to_s
          elsif height.positive? && !width.positive?
            img["width"] = [(height * w.to_f / h).round, 1].max.to_s
          elsif !width.positive? && !height.positive?
            img["width"], img["height"] = w.to_s, h.to_s
          end
        rescue SystemCallError, ArgumentError
          nil
        end

        def image_size(file)
          File.open(file, "rb") do |io|
            head = io.read(24).to_s
            return head[16, 8].unpack("NN") if head.start_with?("\x89PNG".b) && head.bytesize >= 24
            return head[6, 4].unpack("vv") if head.start_with?("GIF8") && head.bytesize >= 10
            if head.start_with?("\xff\xd8".b)
              io.seek(2)
              until io.eof?
                next unless io.read(1) == "\xff".b
                marker = io.read(1)&.ord
                next if marker == 255
                break if marker.nil? || [217, 218].include?(marker)
                next if marker == 1 || (208..215).cover?(marker)
                length = io.read(2)&.unpack1("n")
                break unless length && length >= 2
                if [192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].include?(marker)
                  data = io.read(5)
                  return data[1, 4].unpack("nn").reverse if data&.bytesize == 5
                  break
                end
                io.seek(length - 2, IO::SEEK_CUR)
              end
            end
          end
          nil
        end
      end
    end
  end
end
