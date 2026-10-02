# frozen_string_literal: true

require "cgi"
require_relative "../content/markup_attrs"

module Jekyll
  # Citation placeholders: {% cite %} / {% citet %} / {% nocite %} / {% bibliography %}.
  # Labels and the reference list are filled in content/transforms/bibliography.rb.
  module BibliographyTags
    KEY_RE = Jekyll::Content::MarkupAttrs::ID_RE

    module_function

    def parse_cite(markup, tag)
      match = markup.to_s.strip.match(/\A([A-Za-z][\w-]*)(?:\s+"([^"]*)")?\z/)
      unless match
        raise ArgumentError,
              %(Invalid #{tag} #{markup.inspect}. Expected: {% #{tag} key %} or {% #{tag} key "locator" %})
      end

      locator = match[2].to_s.strip
      [match[1], locator.empty? ? nil : locator]
    end

    def parse_nocite(markup)
      keys = markup.to_s.strip.split(/\s+/)
      if keys.empty? || keys.any? { |key| !KEY_RE.match?(key) }
        raise ArgumentError,
              %(Invalid nocite #{markup.inspect}. Expected: {% nocite key [key ...] %})
      end

      keys
    end

    def escape(text)
      CGI.escapeHTML(text.to_s)
    end

    class CiteTag < Liquid::Tag
      def initialize(tag_name, markup, tokens)
        super
        @markup = markup.to_s
        @form = { "citet" => "text", "citeyear" => "year" }.fetch(tag_name, "paren")
      end

      def render(_context)
        key, locator = Jekyll::BibliographyTags.parse_cite(@markup, @form == "text" ? "citet" : "cite")
        locator_attr = locator ? %( data-locator="#{Jekyll::BibliographyTags.escape(locator)}") : ""
        %(<a class="cite-ref" data-cite="#{key}" data-cite-form="#{@form}" href="#ref-#{key}"#{locator_attr}></a>)
      end
    end

    class NociteTag < Liquid::Tag
      def initialize(tag_name, markup, tokens)
        super
        @markup = markup.to_s
      end

      def render(_context)
        keys = Jekyll::BibliographyTags.parse_nocite(@markup)
        %(<span data-nocite="#{Jekyll::BibliographyTags.escape(keys.join(" "))}" hidden></span>)
      end
    end

    class BibliographyTag < Liquid::Tag
      def initialize(tag_name, markup, tokens)
        super
        @markup = markup.to_s.strip
      end

      def render(_context)
        unless @markup.empty?
          raise ArgumentError, "bibliography takes no arguments"
        end

        %(<section data-bibliography></section>)
      end
    end
  end
end

Liquid::Template.register_tag("cite", Jekyll::BibliographyTags::CiteTag)
Liquid::Template.register_tag("citet", Jekyll::BibliographyTags::CiteTag)
Liquid::Template.register_tag("citeyear", Jekyll::BibliographyTags::CiteTag)
Liquid::Template.register_tag("nocite", Jekyll::BibliographyTags::NociteTag)
Liquid::Template.register_tag("bibliography", Jekyll::BibliographyTags::BibliographyTag)
