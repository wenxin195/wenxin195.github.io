# frozen_string_literal: true

require "nokogiri"

module Jekyll
  module Content
    module Transforms
      # Collapse every mermaid authoring form into one host: div.mermaid.
      # Chart fences stay as Rouge / GFM output for the chart client.
      module Diagrams
        module_function

        def apply!(frag)
          unwrap_highlighter_fences!(frag)
          unwrap_gfm_fences!(frag)
          normalize_mermaid_pres!(frag)
        end

        def unwrap_highlighter_fences!(frag)
          frag.css("div.highlighter-rouge").each do |shell|
            code = shell.at_css("code.language-mermaid")
            next unless language_of(shell) == "mermaid" || code

            source = mermaid_source(code || shell)
            next if source.empty?

            shell.replace(mermaid_host(frag, source, shell))
          end
        end

        # GFM + Rouge with no mermaid lexer: <pre><code class="language-mermaid">
        def unwrap_gfm_fences!(frag)
          frag.css("code.language-mermaid").each do |code|
            pre = code.parent
            next unless pre&.name == "pre"
            next if pre.ancestors(".code-block").any?

            source = mermaid_source(code)
            next if source.empty?

            pre.replace(mermaid_host(frag, source, pre))
          end
        end

        def normalize_mermaid_pres!(frag)
          frag.css("pre.mermaid").each do |pre|
            next if pre.ancestors("code, .code-block").any?

            source = mermaid_source(pre)
            next if source.empty?

            pre.replace(mermaid_host(frag, source, pre))
          end
        end

        def mermaid_host(frag, source, from)
          host = Nokogiri::XML::Node.new("div", frag)
          host["class"] = host_class(from)
          host["id"] = from["id"] if from["id"] && !from["id"].empty?

          from.attribute_nodes.each do |attr|
            name = attr.name
            next unless name.start_with?("data-mermaid-")

            host[name] = attr.value
          end

          host.content = source
          host
        end

        def mermaid_source(node)
          copy = node.dup
          copy.css("br").each do |br|
            br.replace(Nokogiri::XML::Text.new("<br/>", br.document))
          end
          copy.text.strip
        end

        def host_class(from)
          extra = from["class"].to_s.split - %w[
            mermaid highlighter-rouge highlight language-mermaid
          ]
          (["mermaid"] + extra).join(" ")
        end

        def language_of(shell)
          shell["class"].to_s.split
                        .find { |c| c.start_with?("language-") }
                        &.sub(/\Alanguage-/, "")
                        .to_s
        end
      end
    end
  end
end
