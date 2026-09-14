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
      # Chart stays as Rouge output for the chart client. ```mermaid fences are
      # unwrapped in the same highlighter-rouge pass (Enhancer) before this runs.
      module CodeBlocks
        SKIP_LANGS = %w[mermaid chart].freeze

        class Pipeline
          def initialize(site)
            @site = site
            %w[file-code code clipboard].each do |name|
              Icons.assert_exists!(site, name)
            end
          end

          def apply!(frag)
            frag.css("div.highlighter-rouge").each do |shell|
              transform_shell!(shell, frag)
            end
          end

          def transform_shell!(shell, frag)
            classes = shell["class"].to_s.split
            return if classes.include?("code-block")

            lang = language_from(classes)
            return if SKIP_LANGS.include?(lang)

            pre, code = locate_pre_code(shell)
            return if code.nil?

            lineno = !classes.include?("nolineno")
            wrap_lines!(code) if lineno

            if !lang.empty? && language_from(code["class"].to_s.split).empty?
              existing = code["class"].to_s
              code["class"] = ["language-#{lang}", existing].reject(&:empty?).join(" ")
            end

            file = attr_among(shell, %w[file data-file])
            shell.replace(
              build_figure(
                frag,
                lang: lang,
                file: file,
                lineno: lineno,
                pre: pre,
                code: code
              )
            )
          end

          private

          def language_from(classes)
            classes.find { |c| c.start_with?("language-") }&.sub(/\Alanguage-/, "").to_s
          end

          def attr_among(node, names)
            names.each do |name|
              value = node[name]
              return value if value && !value.empty?
            end
            nil
          end

          def locate_pre_code(shell)
            if (cell = shell.at_css("td.rouge-code"))
              pre = cell.at_css("pre")
              code = child_named(pre, "code") || child_named(cell, "code") || pre
              return [pre, code]
            end

            pre = child_named(shell.at_css("div.highlight"), "pre") || shell.at_css("pre")
            code = child_named(pre, "code") ||
                   child_named(shell.at_css("div.highlight"), "code") ||
                   shell.at_css("code")
            [pre, code]
          end

          def child_named(node, name)
            return nil unless node

            node.element_children.find { |child| child.name == name }
          end

          # Rouge often puts a trailing "\n" inside a token span (e.g. Chinese
          # comments: <span class="c1"># …\n</span>). Walk the already-parsed
          # tree so highlighted HTML is never serialized and parsed again.
          def wrap_lines!(code)
            lines = split_into_lines(code.children.to_a)
            lines.pop if lines.length > 1 && line_blank?(lines.last)

            code.children.each(&:unlink)
            doc = code.document
            last = lines.length - 1
            lines.each_with_index do |kids, index|
              line = Nokogiri::XML::Node.new("span", doc)
              line["class"] = "code-block__line"
              line["data-line"] = (index + 1).to_s

              inner = Nokogiri::XML::Node.new("span", doc)
              inner["class"] = "code-block__code"
              kids.each { |kid| inner.add_child(kid) }

              line.add_child(inner)
              code.add_child(line)
              code.add_child(Nokogiri::XML::Text.new("\n", doc)) unless index == last
            end
          end

          def split_into_lines(nodes)
            lines = [[]]
            nodes.each do |node|
              pieces = line_pieces(node)
              next if pieces.empty?

              lines.last.concat(pieces[0])
              pieces.drop(1).each { |piece| lines << piece }
            end
            lines
          end

          def line_pieces(node)
            if node.text?
              node.content.split(/\r?\n/, -1).map do |part|
                part.empty? ? [] : [Nokogiri::XML::Text.new(part, node.document)]
              end
            elsif node.element?
              split_into_lines(node.children.to_a).map do |kids|
                [clone_with_children(node, kids)]
              end
            else
              [[node]]
            end
          end

          def clone_with_children(node, kids)
            copy = Nokogiri::XML::Node.new(node.name, node.document)
            node.attribute_nodes.each { |attr| copy[attr.name] = attr.value }
            kids.each { |kid| copy.add_child(kid) }
            copy
          end

          def line_blank?(nodes)
            nodes.all? { |node| node.text.empty? }
          end

          def build_figure(frag, lang:, file:, lineno:, pre:, code:)
            figure = Nokogiri::XML::Node.new("figure", frag)
            figure["class"] = "code-block"
            figure["data-lang"] = lang unless lang.empty?
            figure["data-lineno"] = lineno ? "true" : "false"
            figure["data-file"] = file if file

            figure.add_child(build_header(frag, lang: lang, file: file))
            figure.add_child(build_body(frag, pre: pre, code: code))
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

          def build_body(frag, pre:, code:)
            body = Nokogiri::XML::Node.new("div", frag)
            body["class"] = "code-block__body"
            body["tabindex"] = "0"

            if pre
              pre["class"] = "highlight"
              pre.unlink
              body.add_child(pre)
            else
              wrapper = Nokogiri::XML::Node.new("pre", frag)
              wrapper["class"] = "highlight"
              code.unlink
              wrapper.add_child(code)
              body.add_child(wrapper)
            end

            body
          end
        end
      end
    end
  end
end
