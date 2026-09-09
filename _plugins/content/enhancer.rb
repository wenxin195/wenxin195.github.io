# frozen_string_literal: true

require "nokogiri"
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
    # Diagrams first so mermaid is a div.mermaid before code-block chrome runs.
    # Figure/table numbering runs with the HTML transforms (tabref after wrap).
    class Enhancer
      def initialize(site)
        @site = site
        @code_blocks = Transforms::CodeBlocks::Pipeline.new(site)
      end

      def enhance(html)
        return html if html.nil? || html.empty?

        frag = Nokogiri::HTML::DocumentFragment.parse(html)
        Transforms::Diagrams.apply!(frag)
        Transforms::Figures.apply!(frag)
        Transforms::Images.apply!(frag)
        Transforms::Tables.apply!(frag)
        Transforms::TaskLists.apply!(frag, @site)
        @code_blocks.apply!(frag)
        yield frag if block_given?
        frag.to_html
      end
    end
  end
end
