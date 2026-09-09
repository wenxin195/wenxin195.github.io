# frozen_string_literal: true

require_relative "../content/markup_attrs"

module Jekyll
  # Numbered post figures: {% figures %} / {% panel %} / {% figref %}.
  # Captions are filled with 图 N in content/transforms/figures.rb.
  module Figures
    ALIGNMENTS = %w[start center end].freeze
    PANEL_STACK = :figure_panel_stack

    module_function

    def resolve_src(src, context)
      raw = src.to_s.strip
      raise ArgumentError, "panel requires src" if raw.empty?
      return raw if raw.match?(%r{\A(?:https?:)?//}) || raw.start_with?("data:")

      path = raw.start_with?("/") ? raw : "/#{raw}"
      baseurl = context.registers[:site].config["baseurl"].to_s.chomp("/")
      "#{baseurl}#{path}"
    end

    def sub_prefix(index)
      return "(#{index + 1})" if index >= 26

      "(#{('a'.ord + index).chr})"
    end

    # {% figures id="buffon" caption="比丰投针" cols=2 align=end %}
    class FiguresBlock < Liquid::Block
      def initialize(tag_name, markup, tokens)
        super
        @markup = markup.to_s.strip
      end

      def render(context)
        attrs = Jekyll::Content::MarkupAttrs.parse_attrs(@markup, "figures")
        id = attrs["id"].to_s
        caption = attrs["caption"].to_s
        cols =
          begin
            Integer(attrs.fetch("cols", "1"), 10)
          rescue ArgumentError, TypeError
            raise ArgumentError, "figures cols must be an integer, got #{attrs['cols'].inspect}"
          end
        align = attrs.fetch("align", "end")

        raise ArgumentError, "figures requires id" unless Jekyll::Content::MarkupAttrs::ID_RE.match?(id)
        raise ArgumentError, "figures requires caption" if caption.empty?
        unless cols.between?(1, 12)
          raise ArgumentError, "figures cols must be 1–12, got #{cols}"
        end
        unless ALIGNMENTS.include?(align)
          raise ArgumentError,
                "figures align must be #{ALIGNMENTS.join('|')}, got #{align.inspect}"
        end

        stack = (context.registers[PANEL_STACK] ||= [])
        stack.push([])
        begin
          super
          panels = stack.last
        ensure
          stack.pop
        end
        if panels.nil? || panels.empty?
          raise ArgumentError, "figures #{id.inspect} needs at least one panel"
        end

        grid = panels.each_with_index.map do |panel, i|
          cap = panel[:caption]
          sub =
            if panels.size > 1
              cap.empty? ? Jekyll::Figures.sub_prefix(i) : "#{Jekyll::Figures.sub_prefix(i)} #{cap}"
            else
              cap
            end
          cap_html =
            if sub.empty?
              ""
            else
              %(<figcaption class="post-figure__sub">#{sub}</figcaption>)
            end
          width_attr =
            if panel[:width]
              %( width="#{panel[:width]}" style="width: #{panel[:width]}px")
            else
              ""
            end
          <<~HTML
            <figure class="post-figure__panel">
              <img src="#{panel[:src]}" alt="#{panel[:alt]}"#{width_attr} />
              #{cap_html}
            </figure>
          HTML
        end.join

        <<~HTML
          <figure class="post-figure" id="fig-#{id}" data-figure data-figure-id="#{id}">
            <div class="post-figure__grid post-figure__grid--#{align}" style="--cols: #{cols}">
              #{grid}
            </div>
            <figcaption class="post-figure__caption">
              <span class="post-figure__label"></span>
              <span class="post-figure__title">#{Jekyll::Content::MarkupAttrs.escape(caption)}</span>
            </figcaption>
          </figure>
        HTML
      end
    end

    # {% panel src="/assets/..." caption="…" alt="…" width=300 %}
    class PanelTag < Liquid::Tag
      def initialize(tag_name, markup, tokens)
        super
        @markup = markup.to_s.strip
      end

      def render(context)
        stack = context.registers[PANEL_STACK]
        unless stack&.last
          raise ArgumentError, "panel must be inside {% figures %}…{% endfigures %}"
        end

        attrs = Jekyll::Content::MarkupAttrs.parse_attrs(@markup, "panel")
        src = Jekyll::Figures.resolve_src(attrs["src"], context)
        caption = Jekyll::Content::MarkupAttrs.escape(attrs["caption"])
        alt_source = attrs["alt"].to_s
        alt_source = attrs["caption"].to_s if alt_source.empty?
        alt_source = File.basename(attrs["src"].to_s, ".*") if alt_source.empty?
        alt = Jekyll::Content::MarkupAttrs.escape(alt_source)

        width = attrs["width"]
        if width && !width.match?(/\A\d+\z/)
          raise ArgumentError, "panel width must be an integer pixel value"
        end

        stack.last << { src: Jekyll::Content::MarkupAttrs.escape(src), caption: caption, alt: alt, width: width }
        ""
      end
    end

    # {% figref buffon %} or {% figref id="buffon" %}
    class FigrefTag < Liquid::Tag
      def initialize(tag_name, markup, tokens)
        super
        @markup = markup.to_s.strip
      end

      def render(_context)
        id = Jekyll::Content::MarkupAttrs.parse_id(@markup, "figref")
        %(<a class="fig-ref" href="#fig-#{id}" data-fig-ref="#{id}"></a>)
      end
    end
  end
end

Liquid::Template.register_tag("figures", Jekyll::Figures::FiguresBlock)
Liquid::Template.register_tag("panel", Jekyll::Figures::PanelTag)
Liquid::Template.register_tag("figref", Jekyll::Figures::FigrefTag)
