# frozen_string_literal: true

require_relative "../content/markup_attrs"

module Jekyll
  # Numbered post tables: {% table %} / {% tabref %}.
  # Captions are filled with 表 N in content/transforms/tables.rb.
  module Tables
    ALIGNMENTS = %w[left center].freeze

    # {% table id="sample-data" caption="示例数据集" align=center %}
    class TableBlock < Liquid::Block
      def initialize(tag_name, markup, tokens)
        super
        @markup = markup.to_s.strip
      end

      def render(context)
        attrs = Jekyll::Content::MarkupAttrs.parse_attrs(@markup, "table")
        id = attrs["id"].to_s
        caption = attrs["caption"].to_s
        align = attrs["align"]

        unless Jekyll::Content::MarkupAttrs::ID_RE.match?(id)
          raise ArgumentError, "table requires id"
        end
        raise ArgumentError, "table requires caption" if caption.empty?
        if align && !ALIGNMENTS.include?(align)
          raise ArgumentError,
                "table align must be #{ALIGNMENTS.join('|')}, got #{align.inspect}"
        end

        content = super
        escaped = Jekyll::Content::MarkupAttrs.escape(caption)
        align_class = align ? " post-table--#{align}" : ""
        <<~HTML
          <figure class="post-table#{align_class}" id="tbl-#{id}" data-table data-table-id="#{id}">
            <figcaption class="post-table__caption">
              <span class="post-table__label"></span>
              <span class="post-table__title">#{escaped}</span>
            </figcaption>
            <div class="post-table__body" markdown="1">#{content}</div>
          </figure>
        HTML
      end
    end

    # {% tabref sample-data %} or {% tabref id="sample-data" %}
    class TabrefTag < Liquid::Tag
      def initialize(tag_name, markup, tokens)
        super
        @markup = markup.to_s.strip
      end

      def render(_context)
        id = Jekyll::Content::MarkupAttrs.parse_id(@markup, "tabref")
        %(<a class="tab-ref" href="#tbl-#{id}" data-tab-ref="#{id}"></a>)
      end
    end
  end
end

Liquid::Template.register_tag("table", Jekyll::Tables::TableBlock)
Liquid::Template.register_tag("tabref", Jekyll::Tables::TabrefTag)
