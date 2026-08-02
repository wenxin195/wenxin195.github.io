# frozen_string_literal: true

require "nokogiri"
require_relative "../language_name"

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

          def wrap_lines(inner_html)
            parts = inner_html.split(/\r?\n/)
            parts.pop if parts.length > 1 && parts.last.empty?

            parts.each_with_index.map do |line, index|
              %(<span class="code-block__line" data-line="#{index + 1}">#{line}</span>)
            end.join
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
              icon = Nokogiri::XML::Node.new("i", frag)
              icon["class"] = "far fa-file-code fa-fw"
              icon["aria-hidden"] = "true"
              label.add_child(icon)
            else
              label["data-label-text"] = LanguageName.resolve(@site, lang)
              icon = Nokogiri::XML::Node.new("i", frag)
              icon["class"] = "fas fa-code fa-fw small"
              icon["aria-hidden"] = "true"
              label.add_child(icon)
            end

            button = Nokogiri::XML::Node.new("button", frag)
            button["type"] = "button"
            button["class"] = "code-block__copy"
            button["aria-label"] = "复制代码"
            button["data-code-copy"] = ""
            btn_icon = Nokogiri::XML::Node.new("i", frag)
            btn_icon["class"] = "far fa-clipboard"
            btn_icon["aria-hidden"] = "true"
            button.add_child(btn_icon)

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
