# frozen_string_literal: true

require "nokogiri"

module Jekyll
  module Content
    # Plain text for Home cards and the article hero. Article HTML is unchanged.
    #
    # Kept
    #   Prose. Inline strong, em, code, a, del, span, sub, and non-footnote sup
    #   contribute text only. Inline math stays as $...$. img uses its alt.
    #   One sentence each from p, li, h1–h6, blockquote, summary, figcaption,
    #   dt, dd, and div.title (box titles).
    #
    # Dropped
    #   Display math. Footnote markers and div.footnotes. pre, table,
    #   figure.code-block, figure.post-table, div.mermaid. Buttons, form
    #   controls, media, svg, style, and other scripts. aria-hidden nodes.
    #
    # Spaces
    #   Collapse whitespace, then remove a space whose two neighbors are both
    #   CJK letters or CJK punctuation. Spaces next to Latin stay.
    module ExcerptText
      DROP_TAGS = %w[
        style svg iframe canvas video audio form button input textarea select
        nav template noscript script pre table
      ].freeze

      SEGMENT_TAGS = %w[
        p li h1 h2 h3 h4 h5 h6 blockquote summary figcaption dt dd
      ].freeze

      BLOCK_TAGS = %w[
        address article aside details div dl fieldset figure footer form
        h1 h2 h3 h4 h5 h6 header hr main nav ol p pre section table ul
        blockquote summary figcaption dt dd li
      ].freeze

      CJK_NEIGHBOR = "\\p{Han}\\p{Hiragana}\\p{Katakana}\\p{Hangul}" \
                     "，。、；：？！…—～·（）「」『』《》〈〉【】〔〕［］｛｝"

      module_function

      def plain(html)
        frag = Nokogiri::HTML::DocumentFragment.parse(html.to_s)
        tighten(pieces(frag).join(" "))
      end

      def pieces(node)
        return [] if node.comment?
        return [] if drop_element?(node)
        return text_piece(node) if node.text?
        return ["$#{node.text}$"] if inline_math?(node)
        return alt_piece(node) if node.element? && node.name == "img"
        return [" "] if node.element? && node.name == "br"
        return segment_pieces(node) if segment?(node)

        node.children.flat_map { |child| pieces(child) }
      end

      def segment_pieces(node)
        chunks = []
        inline = +""
        node.children.each do |child|
          if block_child?(child)
            chunks << inline
            inline = +""
            chunks.concat(pieces(child))
          else
            inline << inline_bits(child)
          end
        end
        chunks << inline
        chunks.reject { |chunk| chunk.strip.empty? }
      end

      def inline_bits(node)
        return "" if node.comment? || drop_element?(node)
        return node.text if node.text?
        return "$#{node.text}$" if inline_math?(node)
        return node["alt"].to_s if node.element? && node.name == "img"
        return " " if node.element? && node.name == "br"
        return "" unless node.element?

        node.children.map { |child| inline_bits(child) }.join
      end

      def text_piece(node)
        node.text.strip.empty? ? [] : [node.text]
      end

      def alt_piece(node)
        alt = node["alt"].to_s.strip
        alt.empty? ? [] : [alt]
      end

      def tighten(text)
        collapsed = text.gsub(/\s+/u, " ").strip
        collapsed.gsub(/(?<=[#{CJK_NEIGHBOR}]) (?=[#{CJK_NEIGHBOR}])/u, "")
      end

      def segment?(node)
        return false unless node.element?
        return true if SEGMENT_TAGS.include?(node.name)

        node.name == "div" && tokens(node).include?("title")
      end

      def block_child?(node)
        return false unless node.element?
        return false if inline_math?(node) || node.name == "img" || node.name == "br"

        BLOCK_TAGS.include?(node.name) || drop_element?(node)
      end

      def drop_element?(node)
        return false unless node.element?
        return false if inline_math?(node)
        return true if DROP_TAGS.include?(node.name)
        return true if node["aria-hidden"].to_s == "true"
        return true if footnote?(node)
        return true if node.name == "div" && tokens(node).include?("footnotes")
        return true if tokens(node).include?("mermaid")
        return true if node.name == "figure" && tokens(node).include?("code-block")
        return true if node.name == "figure" && tokens(node).include?("post-table")

        false
      end

      def inline_math?(node)
        node.element? && node.name == "script" && node["type"].to_s.strip == "math/tex"
      end

      def footnote?(node)
        return true if node.name == "sup" && node["id"].to_s.start_with?("fnref:")
        return true if node.name == "sup" && tokens(node).include?("footnote")
        return true if node.name == "a" && (tokens(node) & %w[footnote reversefootnote]).any?

        false
      end

      def tokens(node)
        node["class"].to_s.split
      end
      private_class_method :pieces, :segment_pieces, :inline_bits, :text_piece, :alt_piece,
                           :tighten, :segment?, :block_child?, :drop_element?, :inline_math?,
                           :footnote?, :tokens
    end
  end

  module ExcerptTextFilter
    def excerpt_text(html)
      Content::ExcerptText.plain(html)
    end
  end
end

Liquid::Template.register_filter(Jekyll::ExcerptTextFilter) if defined?(Liquid::Template)
