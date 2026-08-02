# frozen_string_literal: true

require "nokogiri"

module Jekyll
  module Content
    module Transforms
      # Replace GFM task-list checkboxes with Font Awesome icons.
      module TaskLists
        module_function

        def apply!(frag)
          frag.css('input.task-list-item-checkbox[type="checkbox"]').each do |input|
            icon = Nokogiri::XML::Node.new("i", frag)
            icon["class"] = if input["checked"]
                              "fas fa-check-circle fa-fw checked"
                            else
                              "far fa-circle fa-fw"
                            end
            input.replace(icon)
          end
        end
      end
    end
  end
end
