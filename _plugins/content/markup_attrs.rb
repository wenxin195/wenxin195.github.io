# frozen_string_literal: true

require "cgi"

module Jekyll
  module Content
    # Keyword attrs for Liquid figure/table tags: key="value" or key=value.
    module MarkupAttrs
      ID_RE = /\A[A-Za-z][\w-]*\z/.freeze

      module_function

      def parse_attrs(markup, tag)
        attrs = {}
        rest = markup.to_s.strip
        until rest.empty?
          m = rest.match(/\A(\w+)=(?:"([^"]*)"|(\S+))(?:\s+|\z)/)
          unless m
            raise ArgumentError,
                  "Invalid #{tag} markup #{markup.inspect}. " \
                  'Expected: key="value" or key=value'
          end

          attrs[m[1]] = m[2] || m[3]
          rest = rest[m[0].length..]
        end
        attrs
      end

      def escape(text)
        CGI.escapeHTML(text.to_s)
      end

      def parse_id(markup, tag)
        raw = markup.to_s.strip
        id =
          if (m = raw.match(/\Aid="([^"]+)"\z/))
            m[1]
          else
            raw
          end
        unless ID_RE.match?(id.to_s)
          raise ArgumentError,
                %(Invalid #{tag} #{markup.inspect}. Expected: {% #{tag} id %} or {% #{tag} id="id" %})
        end
        id
      end
    end
  end
end
