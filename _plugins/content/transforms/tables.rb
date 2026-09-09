# frozen_string_literal: true

require "nokogiri"

module Jekyll
  module Content
    module Transforms
      # Wrap tables for horizontal scroll; assign 表 N / {% tabref %} labels.
      module Tables
        module_function

        def apply!(frag)
          wrap!(frag)
          number!(frag)
        end

        def wrap!(frag)
          frag.css("table").each do |table|
            next if table.ancestors("code, pre, .table-wrapper, .code-block").any?
            next if table.parent&.[]("class").to_s.split.include?("table-wrapper")

            wrapper = Nokogiri::XML::Node.new("div", frag)
            wrapper["class"] = "table-wrapper"
            table.add_next_sibling(wrapper)
            wrapper.add_child(table)
          end
        end

        def number!(frag)
          index = {}
          n = 0

          frag.css("[data-table]").each do |node|
            next if node.ancestors("code, pre, .code-block").any?

            id = node["data-table-id"].to_s
            raise ArgumentError, "table is missing data-table-id" if id.empty?
            if index.key?(id)
              raise ArgumentError, "Duplicate table id #{id.inspect}"
            end

            n += 1
            index[id] = n
            label = node.at_css(".post-table__label")
            label.content = "表 #{n}: " if label
          end

          frag.css("[data-tab-ref]").each do |anchor|
            next if anchor.ancestors("code, pre, .code-block").any?

            id = anchor["data-tab-ref"].to_s
            num = index[id]
            unless num
              raise ArgumentError, "Unknown table id #{id.inspect} in tabref"
            end

            anchor.content = "表 #{num}"
          end
        end
      end
    end
  end
end
