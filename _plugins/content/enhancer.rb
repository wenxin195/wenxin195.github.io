# frozen_string_literal: true

require "nokogiri"
require_relative "transforms/tree"
require_relative "transforms/diagrams"
require_relative "transforms/figures"
require_relative "transforms/images"
require_relative "transforms/tables"
require_relative "transforms/task_lists"
require_relative "transforms/code_blocks"
require_relative "icons"

module Jekyll
  module Content
    # Orchestrates post_convert HTML transforms on a single parse/serialize cycle.
    # Highlighter fences run first (mermaid unwrap or code-block chrome) so later
    # figure/table numbering can skip verbatim regions. One highlighter-rouge walk.
    class Enhancer
      def initialize(site)
        @site = site
        @code_blocks = Transforms::CodeBlocks::Pipeline.new(site)
      end

      def enhance(html)
        return html if html.nil? || html.empty?

        has_mermaid = html.include?("mermaid")
        has_rouge = html.include?("highlighter-rouge")
        frag = Nokogiri::HTML::DocumentFragment.parse(html)

        apply_highlighter_fences!(frag, has_mermaid: has_mermaid) if has_rouge
        Transforms::Diagrams.unwrap_remaining_fences!(frag) if has_mermaid
        Transforms::Figures.apply!(frag) if html.include?("data-figure") || html.include?("data-fig-ref")
        Transforms::Images.apply!(frag) if html.include?("<img")
        Transforms::Tables.apply!(frag) if html.include?("<table") || html.include?("data-table") || html.include?("data-tab-ref")
        Transforms::TaskLists.apply!(frag, @site) if html.include?("task-list")
        yield frag if block_given?
        frag.to_html
      end

      private

      def apply_highlighter_fences!(frag, has_mermaid:)
        frag.css("div.highlighter-rouge").each do |shell|
          if has_mermaid && Transforms::Diagrams.highlighter_mermaid?(shell)
            Transforms::Diagrams.unwrap_highlighter_shell!(shell, frag)
          else
            @code_blocks.transform_shell!(shell, frag)
          end
        end
      end
    end
  end
end
