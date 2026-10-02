# frozen_string_literal: true

require "nokogiri"
require_relative "tree"
require_relative "../../bibliography/library"

module Jekyll
  module Content
    module Transforms
      # Fill {% cite %} / {% citet %} labels and replace {% bibliography %}
      # with the works cited on this page.
      module Bibliography
        HEADING = "参考文献"

        module_function

        def apply!(frag, library)
          cites = frag.css("[data-cite]").reject { |node| Tree.verbatim?(node) }
          nocite_keys = nocite_keys_from(frag)
          sections = frag.css("[data-bibliography]").reject { |node| Tree.verbatim?(node) }

          if sections.length > 1
            raise ArgumentError, "Duplicate {% bibliography %}"
          end

          keys = ordered_keys(cites, nocite_keys)
          section = sections.first

          if keys.any? && section.nil?
            raise ArgumentError, "Missing {% bibliography %} for citations"
          end
          if section && keys.empty?
            raise ArgumentError, "{% bibliography %} has no citations"
          end
          return if section.nil?

          entries = Jekyll::Bibliography::Format.sort_entries(keys.map { |key| fetch!(library, key) })
          suffixes = Jekyll::Bibliography::Format.year_suffixes(entries)
          fill_cites!(cites, entries, suffixes)
          write_section!(section, entries, suffixes)
        end

        def nocite_keys_from(frag)
          keys = []
          parents = []
          frag.css("[data-nocite]").each do |node|
            next if Tree.verbatim?(node)

            keys.concat(node["data-nocite"].to_s.split)
            parents << node.parent
            node.remove
          end
          parents.uniq.each do |parent|
            next unless parent&.name == "p"
            next unless parent.element_children.empty? && parent.text.strip.empty?

            parent.remove
          end
          keys
        end

        def ordered_keys(cites, nocite_keys)
          keys = []
          cites.each do |node|
            key = node["data-cite"].to_s
            keys << key unless key.empty? || keys.include?(key)
          end
          nocite_keys.each do |key|
            keys << key unless keys.include?(key)
          end
          keys
        end

        def fetch!(library, key)
          entry = library[key]
          return entry if entry

          raise ArgumentError, "Unknown citation key #{key.inspect}"
        end

        def fill_cites!(cites, entries, suffixes)
          by_key = entries.to_h { |entry| [entry.key.to_s, entry] }
          cites.each do |node|
            key = node["data-cite"].to_s
            node.inner_html = Jekyll::Bibliography::Format.cite_html(
              by_key.fetch(key),
              node["data-cite-form"],
              node["data-locator"],
              suffixes[key]
            )
            node["href"] = "#ref-#{key}"
          end
        end

        def write_section!(section, entries, suffixes)
          section.remove_attribute("data-bibliography")
          section["class"] = "bibliography"
          section.children.remove

          heading = section.document.create_element("h2", HEADING, id: HEADING)
          list = section.document.create_element("ol")
          entries.each do |entry|
            item = section.document.create_element("li")
            item["id"] = "ref-#{entry.key}"
            item.inner_html = %(<span class="bibliography-text">#{Jekyll::Bibliography::Format.reference_html(entry, suffixes[entry.key.to_s])}</span>)
            list.add_child(item)
          end
          section.add_child(heading)
          section.add_child(list)
        end
      end
    end
  end
end
