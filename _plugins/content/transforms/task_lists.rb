# frozen_string_literal: true

require "nokogiri"
require_relative "../icons"

module Jekyll
  module Content
    module Transforms
      # Replace GFM task-list checkboxes with Lucide icons.
      module TaskLists
        module_function

        def apply!(frag, site)
          frag.css('input.task-list-item-checkbox[type="checkbox"]').each do |input|
            name = input["checked"] ? "circle-check" : "circle"
            extra = input["checked"] ? "checked" : nil
            input.replace(Icons.span_node(input.document, site, name, extra_class: extra))
          end
        end
      end
    end
  end
end
