# frozen_string_literal: true

require "cgi"
require "nokogiri"

module Jekyll
  module Content
    # Build-time article TOC (flat list). Markup must match `assets/scripts/lib/toc.js`
    # so the client can hydrate instead of waiting on the module graph to render.
    module Toc
      DEFAULT_SELECTORS = "h1,h2,h3"

      module_function

      def enabled?(doc)
        aside = doc.data["aside"]
        aside.respond_to?(:[]) && aside["toc"] == true
      end

      def selectors(site)
        from_config = site.config.dig("toc", "selectors").to_s.strip
        from_config.empty? ? DEFAULT_SELECTORS : from_config
      end

      def assign!(doc, frag)
        return unless enabled?(doc)
        return if frag.nil?

        doc.data["toc_html"] = build_html(frag, selectors(doc.site))
      end

      def build_html(frag, selector_str)
        headings = extract(frag, selector_str)
        return "" if headings.empty?

        items = headings.map do |heading|
          text = CGI.escapeHTML(heading[:text])
          id = CGI.escapeHTML(heading[:id])
          %(<li class="toc-item toc-h#{heading[:level]}"><a href="##{id}" title="#{text}">#{text}</a></li>)
        end

        %(<ul class="toc toc--flat">#{items.join}</ul>)
      end

      def extract(frag, selector_str)
        headings = []

        frag.css(selector_str).each do |node|
          id = node["id"].to_s
          next if id.empty?

          level = node.name[/\d+/].to_i
          next if level.zero?

          headings << {
            id: id,
            level: level,
            text: node.text.strip
          }
        end

        headings
      end
    end
  end
end
