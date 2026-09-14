# frozen_string_literal: true

module Jekyll
  module Content
    module Transforms
      # Cheap parent-chain checks so transforms do not run Nokogiri `ancestors()`
      # CSS queries on every match.
      module Tree
        module_function

        def verbatim?(node)
          current = node.parent
          while current
            name = current.name.to_s
            return true if name == "code" || name == "pre"

            classes = current["class"]
            return true if classes && classes.split.include?("code-block")

            current = current.parent
          end
          false
        end
      end
    end
  end
end
