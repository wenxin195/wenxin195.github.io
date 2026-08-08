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
            html = Icons.span_html(site, name, extra_class: extra)
            input.replace(Nokogiri::HTML::DocumentFragment.parse(html))
          end
        end
      end
    end
  end
end
