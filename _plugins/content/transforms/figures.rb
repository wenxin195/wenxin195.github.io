# frozen_string_literal: true

require "nokogiri"

module Jekyll
  module Content
    module Transforms
      # Assign 图 N labels in document order and fill {% figref %} links.
      module Figures
        module_function

        def apply!(frag)
          index = {}
          n = 0

          frag.css("[data-figure]").each do |node|
            next if node.ancestors("code, pre, .code-block").any?

            id = node["data-figure-id"].to_s
            raise ArgumentError, "figure is missing data-figure-id" if id.empty?
            if index.key?(id)
              raise ArgumentError, "Duplicate figure id #{id.inspect}"
            end

            n += 1
            index[id] = n
            label = node.at_css(".post-figure__label")
            label.content = "图 #{n}: " if label
          end

          frag.css("[data-fig-ref]").each do |anchor|
            next if anchor.ancestors("code, pre, .code-block").any?

            id = anchor["data-fig-ref"].to_s
            num = index[id]
            unless num
              raise ArgumentError, "Unknown figure id #{id.inspect} in figref"
            end

            anchor.content = "图 #{num}"
          end
        end
      end
    end
  end
end
