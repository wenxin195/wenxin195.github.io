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

        def apply!(frag, math: false, locale: {})
          used_ids = frag.css("[id]").map { |node| node["id"] }
          frag.css("[data-component]").each do |host|
            source = host.at_css('script[type="application/json"]')
            next unless source
            begin
              config = JSON.parse(source.text)
              next unless config.is_a?(Hash)
              presentation = config["presentation"]
              validate_presentation!(presentation, config)
              host["data-model"] = config["model"].to_s
              host["data-aspect"] = config["aspect"] if %w[wide square portrait].include?(config["aspect"])
              host["data-component-state"] = "pending"
              host.element_children.select { |child| child["class"].to_s.split.include?("interactive-component__header") }.each(&:remove)
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
              wrap_disclosure!(frag, host, config, presentation, used_ids, locale) if presentation && presentation["mode"] == "disclosure"
            rescue JSON::ParserError, TypeError
              # Keep malformed examples readable; the runtime offers an error.
            end
          end
          if math
            frag.xpath(".//text()").to_a.each do |node|
              next unless node.text.include?('\\[')
              next if Tree.verbatim?(node) || inside_tag?(node, %w[script style textarea]) || node.ancestors.any? { |parent| parent["class"].to_s.split.include?("interactive-disclosure__print") }
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
          frag.css("p, h1, h2, h3, h4, summary.interactive-disclosure__summary, figure, table, [data-component], [data-math-block], .mermaid").each_with_index do |node, index|
            next if Tree.verbatim?(node) || inside_component?(node) || node.ancestors.any? { |parent| parent["class"].to_s.split.include?("interactive-disclosure__print") }
            node["data-reading-id"] = "r-#{index}-#{Digest::SHA256.hexdigest(node.text)[0, 10]}"
          end
        end

        def validate_presentation!(value, config)
          return if value.nil?
          valid = value.is_a?(Hash) && (value.keys - %w[mode initial summary]).empty? &&
            %w[inline disclosure].include?(value["mode"]) &&
            (!value.key?("initial") || %w[collapsed expanded].include?(value["initial"])) &&
            (!value.key?("summary") || value["summary"].is_a?(String))
          return if valid
          raise ArgumentError, "交互组件 #{config['title'] || config['model'] || config['type']}：presentation 配置无效（mode: inline/disclosure; initial: collapsed/expanded; summary: 字符串）。"
        end

        def wrap_disclosure!(frag, host, config, presentation, used_ids, locale)
          return if host.parent["data-component-disclosure"]
          base = "interactive-#{Digest::SHA256.hexdigest(JSON.generate(config))[0, 12]}"
          id = base
          suffix = 1
          while used_ids.include?(id) || used_ids.include?("#{id}-content")
            suffix += 1
            id = "#{base}-#{suffix}"
          end
          used_ids.concat([id, "#{id}-content"])
          wrapper = Nokogiri::XML::Node.new("details", frag)
          wrapper["class"] = "interactive-disclosure"
          wrapper["data-component-disclosure"] = ""
          wrapper["id"] = id
          wrapper["open"] = "open" if presentation["initial"] == "expanded"
          summary = Nokogiri::XML::Node.new("summary", frag)
          summary["class"] = "interactive-disclosure__summary"
          title = Nokogiri::XML::Node.new("span", frag)
          title.content = presentation["summary"].to_s.empty? ? config["title"].to_s : presentation["summary"]
          title.content = locale["INTERACTIVE_EXPLORE"] || "交互探索" if title.text.empty?
          summary.add_child(title)
          if !config["description"].to_s.empty?
            description = Nokogiri::XML::Node.new("span", frag)
            description["class"] = "interactive-disclosure__description"
            description.content = config["description"]
            summary.add_child(description)
          end
          { "expand" => ["INTERACTIVE_EXPAND", "展开演示"], "collapse" => ["INTERACTIVE_COLLAPSE", "收起演示"] }.each do |state, (key, fallback)|
            hint = Nokogiri::XML::Node.new("span", frag)
            hint["class"] = "interactive-disclosure__#{state}"
            hint.content = locale[key] || fallback
            summary.add_child(hint)
          end
          host.add_previous_sibling(wrapper)
          wrapper.add_child(summary)
          host["id"] ||= "#{id}-content"
          summary["aria-controls"] = host["id"]
          wrapper.add_child(host.unlink)
          # Separate from the live root: mount() replaces its fallback content.
          fallback = Nokogiri::XML::Node.new("div", frag)
          fallback["class"] = "interactive-disclosure__print tex2jax_ignore"
          host.children.each do |child|
            next if child.name == "script"
            copy = child.dup(1)
            copy.css("[id]").each { |node| node.remove_attribute("id") }
            copy.remove_attribute("id") if copy.element?
            fallback.add_child(copy)
          end
          wrapper.add_child(fallback)
        end

        def inside_tag?(node, names)
          current = node.parent
          while current
            return true if names.include?(current.name)
            current = current.parent
          end
          false
        end

        def inside_component?(node)
          current = node.parent
          while current
            return true if current.attribute("data-component")
            current = current.parent
          end
          false
        end
      end
    end
  end
end
