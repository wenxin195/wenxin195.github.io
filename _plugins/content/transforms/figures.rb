# frozen_string_literal: true

require "nokogiri"
require_relative "tree"

module Jekyll
  module Content
    module Transforms
      # Assign 图 N labels in document order and fill {% figref %} links.
      module Figures
        module_function

        def apply!(frag, label: "图")
          index = {}
          n = 0

          frag.css("[data-figure]").each do |node|
            next if Tree.verbatim?(node)

            id = node["data-figure-id"].to_s
            raise ArgumentError, "figure is missing data-figure-id" if id.empty?
            if index.key?(id)
              raise ArgumentError, "Duplicate figure id #{id.inspect}"
            end

            n += 1
            index[id] = n
            label_node = node.at_css(".post-figure__label")
            label_node.content = "#{label} #{n}: " if label_node
          end

          frag.css("[data-fig-ref]").each do |anchor|
            next if Tree.verbatim?(anchor)

            id = anchor["data-fig-ref"].to_s
            num = index[id]
            unless num
              raise ArgumentError, "Unknown figure id #{id.inspect} in figref"
            end

            anchor.content = "#{label} #{num}"
          end
        end
      end
    end
  end
end
