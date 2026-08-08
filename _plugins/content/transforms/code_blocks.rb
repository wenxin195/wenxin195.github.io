# frozen_string_literal: true

require "nokogiri"
require_relative "../language_name"
require_relative "../icons"

module Jekyll
  module Content
    module Transforms
      # Build-time pipeline: Rouge HTML → canonical <figure class="code-block">.
      #
      # Author API (Kramdown IAL after the fence):
      #   {: file="path.ext"}  — header shows filename
      #   {: .nolineno }       — omit line numbers (default: on, from 1)
      #
      # Skipped languages (left as Rouge output for client providers): mermaid, chart.
      module CodeBlocks
        SKIP_LANGS = %w[mermaid chart].freeze

        class Pipeline
          def initialize(site)
            @site = site
          end

          def apply!(frag)
            frag.css("div.highlighter-rouge").each do |shell|
              next if shell.ancestors("figure.code-block").any?
              next if shell["class"].to_s.split.include?("code-block")

              transform_shell!(shell, frag)
            end
          end

          private

          def transform_shell!(shell, frag)
            lang = extract_lang(shell)
            return if SKIP_LANGS.include?(lang)

            classes = shell["class"].to_s.split
            lineno = !classes.include?("nolineno")
            file = attr_among(shell, %w[file data-file])

            code_html = extract_code_html(shell)
            return if code_html.nil?

            code_html = wrap_lines(code_html) if lineno

            figure = build_figure(
              frag,
              lang: lang,
              file: file,
              lineno: lineno,
              code_html: code_html
            )
            shell.replace(figure)
          end

          def extract_lang(shell)
            shell["class"].to_s.split
                          .find { |c| c.start_with?("language-") }
                          &.sub(/\Alanguage-/, "")
                          .to_s
          end

          def attr_among(node, names)
            names.each do |name|
              value = node[name]
              return value if value && !value.empty?
            end
            nil
          end

          # Prefer Rouge <code> inner HTML; unwrap table line-number layout if present.
          def extract_code_html(shell)
            if (cell = shell.at_css("td.rouge-code > pre, td.rouge-code"))
              return cell.inner_html
            end

            code = shell.at_css("div.highlight pre code, div.highlight > code, pre code, code")
            return nil unless code

            code.inner_html
          end

          # Rouge often puts the trailing "\n" inside a token span (e.g. Chinese
          # comments: <span class="c1"># …\n</span>). Splitting on "\n" alone
          # breaks tags; Nokogiri then nests/repairs lines and layout collapses.
          # Split on newlines while closing/reopening the open <span> stack.
          def wrap_lines(inner_html)
            lines = split_html_lines(inner_html)
            lines.pop if lines.length > 1 && lines.last.empty?

            lines.each_with_index.map do |line, index|
              %(<span class="code-block__line" data-line="#{index + 1}"><span class="code-block__code">#{line}</span></span>)
            end.join("\n")
          end

          def split_html_lines(inner_html)
            lines = []
            current = +""
            open_spans = []

            inner_html.split(/(<span\b[^>]*>|<\/span>)/).each do |token|
              next if token.empty?

              if token.start_with?("<span")
                open_spans << token
                current << token
              elsif token == "</span>"
                open_spans.pop
                current << token
              else
                token.split(/\r?\n/, -1).each_with_index do |piece, i|
                  if i.positive?
                    open_spans.reverse_each { current << "</span>" }
                    lines << current
                    current = +""
                    open_spans.each { |tag| current << tag }
                  end
                  current << piece
                end
              end
            end

            lines << current
            lines
          end

          def build_figure(frag, lang:, file:, lineno:, code_html:)
            figure = Nokogiri::XML::Node.new("figure", frag)
            figure["class"] = "code-block"
            figure["data-lang"] = lang unless lang.empty?
            figure["data-lineno"] = lineno ? "true" : "false"
            figure["data-file"] = file if file

            figure.add_child(build_header(frag, lang: lang, file: file))
            figure.add_child(build_body(frag, lang: lang, code_html: code_html))
            figure
          end

          def build_header(frag, lang:, file:)
            header = Nokogiri::XML::Node.new("figcaption", frag)
            header["class"] = "code-block__header"

            label = Nokogiri::XML::Node.new("span", frag)
            label["class"] = "code-block__label"

            if file
              label["data-label-text"] = file
              Icons.append_span!(label, @site, "file-code")
            else
              label["data-label-text"] = LanguageName.resolve(@site, lang)
              Icons.append_span!(label, @site, "code", extra_class: "icon-lucide--sm")
            end

            button = Nokogiri::XML::Node.new("button", frag)
            button["type"] = "button"
            button["class"] = "code-block__copy"
            button["aria-label"] = "复制代码"
            button["data-code-copy"] = ""
            Icons.append_span!(button, @site, "clipboard")

            header.add_child(label)
            header.add_child(button)
            header
          end

          def build_body(frag, lang:, code_html:)
            body = Nokogiri::XML::Node.new("div", frag)
            body["class"] = "code-block__body"
            body["tabindex"] = "0"

            pre = Nokogiri::XML::Node.new("pre", frag)
            pre["class"] = "highlight"

            code = Nokogiri::XML::Node.new("code", frag)
            code["class"] = "language-#{lang}" unless lang.empty?
            code.inner_html = code_html

            pre.add_child(code)
            body.add_child(pre)
            body
          end
        end
      end
    end
  end
end
