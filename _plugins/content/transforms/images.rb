# frozen_string_literal: true

require_relative "tree"

module Jekyll
  module Content
    module Transforms
      # Defer below-fold content images; leave the first image for LCP.
      module Images
        module_function

        def apply!(frag)
          first = true
          frag.css("img").each do |img|
            next if Tree.verbatim?(img)

            img["decoding"] = "async" if img["decoding"].to_s.empty?
            if first
              first = false
              img["fetchpriority"] = "high" if img["fetchpriority"].to_s.empty?
              next
            end
            img["loading"] = "lazy" if img["loading"].to_s.empty?
          end
        end
      end
    end
  end
end
