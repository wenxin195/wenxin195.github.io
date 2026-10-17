# frozen_string_literal: true

require "json"
require "digest"
require_relative "tree"

module Jekyll
  module Content
    module Transforms
      # Stable reading targets and no-JS component descriptions are built once.
      module Loading
        module_function

        def apply!(frag, math: false)
          frag.css("[data-component]").each do |host|
            source = host.at_css('script[type="application/json"]')
            next unless source
            begin
              config = JSON.parse(source.text)
              next unless config.is_a?(Hash)
              host["data-model"] = config["model"].to_s
              host["data-component-state"] = "pending"
              header = Nokogiri::XML::Node.new("header", frag)
              header["class"] = "interactive-component__header"
              { "title" => ["h3", "title"], "description" => ["p", "description"] }.each do |key, (tag, suffix)|
                next if config[key].to_s.empty?
                node = Nokogiri::XML::Node.new(tag, frag)
                node["class"] = "interactive-component__#{suffix}"
                node.content = config[key].to_s
                header.add_child(node)
              end
              source.add_next_sibling(header)
            rescue JSON::ParserError, TypeError
              # Keep malformed examples readable; the runtime offers an error.
            end
          end
          if math
            frag.xpath(".//text()").to_a.each do |node|
              next if Tree.verbatim?(node) || node.ancestors.any? { |p| %w[script style textarea].include?(p.name) }
              next unless node.text.include?('\\[')
              pieces = node.text.split(/(\\\[.*?\\\])/m)
              next if pieces.length == 1
              pieces.each do |piece|
                if piece.start_with?('\\[') && piece.end_with?('\\]')
                  block = Nokogiri::XML::Node.new("span", frag)
                  block["class"] = "math-block"
                  block["data-math-block"] = ""
                  block.content = piece
                  node.add_previous_sibling(block)
                else
                  node.add_previous_sibling(Nokogiri::XML::Text.new(piece, frag.document))
                end
              end
              node.remove
            end
          end
          frag.css("p, h1, h2, h3, h4, figure, table, [data-component], [data-math-block], .mermaid").each_with_index do |node, index|
            next if Tree.verbatim?(node) || node.ancestors("[data-component]").any?
            node["data-reading-id"] = "r-#{index}-#{Digest::SHA256.hexdigest(node.text)[0, 10]}"
          end
        end
      end
    end
  end
end
