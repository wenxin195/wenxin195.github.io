# frozen_string_literal: true

require "nokogiri"
require_relative "tree"

module Jekyll
  module Content
    module Transforms
      # Wrap tables for horizontal scroll; assign 表 N / {% tabref %} labels.
      module Tables
        module_function

        def apply!(frag, label: "表")
          wrap!(frag)
          number!(frag, label: label)
        end

        def wrap!(frag)
          frag.css("table").each do |table|
            next if Tree.verbatim?(table)
            next if table.parent&.[]("class").to_s.split.include?("table-wrapper")

            wrapper = Nokogiri::XML::Node.new("div", frag)
            wrapper["class"] = "table-wrapper"
            table.add_next_sibling(wrapper)
            wrapper.add_child(table)
          end
        end

        def number!(frag, label: "表")
          index = {}
          n = 0

          frag.css("[data-table]").each do |node|
            next if Tree.verbatim?(node)

            id = node["data-table-id"].to_s
            raise ArgumentError, "table is missing data-table-id" if id.empty?
            if index.key?(id)
              raise ArgumentError, "Duplicate table id #{id.inspect}"
            end

            n += 1
            index[id] = n
            label_node = node.at_css(".post-table__label")
            label_node.content = "#{label} #{n}: " if label_node
          end

          frag.css("[data-tab-ref]").each do |anchor|
            next if Tree.verbatim?(anchor)

            id = anchor["data-tab-ref"].to_s
            num = index[id]
            unless num
              raise ArgumentError, "Unknown table id #{id.inspect} in tabref"
            end

            anchor.content = "#{label} #{num}"
          end
        end
      end
    end
  end
end
