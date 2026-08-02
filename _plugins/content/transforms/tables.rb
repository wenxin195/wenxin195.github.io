# frozen_string_literal: true

require "nokogiri"

module Jekyll
  module Content
    module Transforms
      # Wrap bare <table> nodes for horizontal scroll on narrow viewports.
      module Tables
        module_function

        def apply!(frag)
          frag.css("table").each do |table|
            next if table.ancestors("code, pre, .table-wrapper, .code-block").any?
            next if table.parent&.[]("class").to_s.split.include?("table-wrapper")

            wrapper = Nokogiri::XML::Node.new("div", frag)
            wrapper["class"] = "table-wrapper"
            table.add_next_sibling(wrapper)
            wrapper.add_child(table)
          end
        end
      end
    end
  end
end
