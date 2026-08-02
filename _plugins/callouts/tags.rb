# frozen_string_literal: true

module Jekyll
  # Liquid tags for titled callouts. Untitled short tips use blockquote + {: .prompt-*}.
  module Callouts
    BOX_TYPES = %w[tip info warning danger].freeze
    DETAILS_TYPES = %w[definition theorem proposition example].freeze

    # {% box danger "Title" %}…{% endbox %}
    class BoxBlock < Liquid::Block
      def initialize(tag_name, markup, tokens)
        super
        @markup = markup.to_s.strip
      end

      def render(context)
        type, title = parse_markup(@markup)
        unless BOX_TYPES.include?(type)
          raise ArgumentError,
                "Unknown box type #{type.inspect}. Expected one of: #{BOX_TYPES.join(', ')}"
        end
        if title.nil? || title.empty?
          raise ArgumentError,
                "box #{type.inspect} requires a quoted title. " \
                "For untitled short tips use: > …\\n{: .prompt-#{type}}"
        end

        content = super
        %(<div class="box-#{type}" markdown="1"><div class="title">#{title}</div>#{content}</div>)
      end

      private

      def parse_markup(markup)
        if markup.empty?
          raise ArgumentError,
                'box tag requires: type "Title" (types: tip|info|warning|danger)'
        end

        m = markup.match(/\A(\S+)\s+"([^"]*)"\z/)
        unless m
          raise ArgumentError,
                "Invalid box markup #{markup.inspect}. " \
                'Expected: {% box type "Title" %}. ' \
                "Untitled tips: > …\\n{: .prompt-TYPE}"
        end

        [m[1], m[2]]
      end
    end

    # {% details proposition "Title" open %}…{% enddetails %}
    class DetailsBlock < Liquid::Block
      def initialize(tag_name, markup, tokens)
        super
        @markup = markup.to_s.strip
      end

      def render(context)
        type, summary, open = parse_markup(@markup)
        unless DETAILS_TYPES.include?(type)
          raise ArgumentError,
                "Unknown details type #{type.inspect}. Expected one of: #{DETAILS_TYPES.join(', ')}"
        end
        raise ArgumentError, "details tag requires a summary title" if summary.nil? || summary.empty?

        content = super
        open_attr = open ? " open" : ""
        %(<details class="details-#{type}" markdown="1"#{open_attr}><summary>#{summary}</summary>#{content}</details>)
      end

      private

      def parse_markup(markup)
        if markup.empty?
          raise ArgumentError,
                "details tag requires: type summary [open] (types: #{DETAILS_TYPES.join(', ')})"
        end

        # type "summary with spaces" open
        # type "summary"
        # type SummaryWord open
        # type SummaryWord
        m = markup.match(
          /\A(\S+)\s+(?:"([^"]*)"|(\S+))(?:\s+(open))?\z/
        )
        unless m
          raise ArgumentError,
                "Invalid details markup #{markup.inspect}. " \
                'Expected: {% details type "Title" [open] %}'
        end

        type = m[1]
        summary = m[2] || m[3]
        open = m[4] == "open"
        [type, summary, open]
      end
    end
  end
end

Liquid::Template.register_tag("box", Jekyll::Callouts::BoxBlock)
Liquid::Template.register_tag("details", Jekyll::Callouts::DetailsBlock)
