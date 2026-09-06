# frozen_string_literal: true

require "nokogiri"

module Jekyll
  module Content
    module Transforms
      # ```mermaid fences → one host: div.mermaid.
      # Chart fences stay as Rouge / GFM output for the chart client.
      module Diagrams
        module_function

        def apply!(frag)
          unwrap_highlighter_fences!(frag)
          unwrap_remaining_fences!(frag)
        end

        def unwrap_highlighter_fences!(frag)
          frag.css("div.highlighter-rouge").each do |shell|
            next unless mermaid_language?(shell)

            source = mermaid_source(code_from(shell) || shell)
            next if source.empty?

            shell.replace(mermaid_host(frag, source, shell))
          end
        end

        # Leftovers when Rouge has no mermaid lexer:
        # <pre><code class="language-mermaid"> or <pre class="language-mermaid">.
        def unwrap_remaining_fences!(frag)
          seen = {}

          frag.css("code.language-mermaid, pre.language-mermaid").each do |node|
            pre = node.name == "pre" ? node : node.ancestors("pre").first
            next unless pre
            next if pre.ancestors(".code-block, .mermaid").any?

            target = pre.ancestors("div.highlighter-rouge").first || pre
            next if seen[target]

            seen[target] = true
            source = mermaid_source(code_from(target) || target)
            next if source.empty?

            target.replace(mermaid_host(frag, source, target))
          end
        end

        def mermaid_language?(node)
          language_of(node) == "mermaid" || !node.at_css("code.language-mermaid").nil?
        end

        def code_from(node)
          node.at_css("code.language-mermaid") || node.at_css("code")
        end

        def mermaid_host(frag, source, from)
          host = Nokogiri::XML::Node.new("div", frag)
          host["class"] = host_class(from)
          host["id"] = from["id"] if from["id"] && !from["id"].empty?

          copy_mermaid_data!(host, from)
          from.css("pre, code").each { |inner| copy_mermaid_data!(host, inner) }

          host.content = source
          host
        end

        def copy_mermaid_data!(host, from)
          from.attribute_nodes.each do |attr|
            name = attr.name
            next unless name.start_with?("data-mermaid-")

            host[name] = attr.value
          end
        end

        def mermaid_source(node)
          copy = node.dup
          copy.css("br").each do |br|
            br.replace(Nokogiri::XML::Text.new("\n", br.document))
          end
          copy.text.strip
        end

        def host_class(from)
          extra = from["class"].to_s.split - %w[
            mermaid highlighter-rouge highlight language-mermaid
          ]
          (["mermaid"] + extra).join(" ")
        end

        def language_of(node)
          node["class"].to_s.split
                        .find { |c| c.start_with?("language-") }
                        &.sub(/\Alanguage-/, "")
                        .to_s
        end
      end
    end
  end
end
