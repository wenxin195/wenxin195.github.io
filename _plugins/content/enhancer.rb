# frozen_string_literal: true

require "nokogiri"
require_relative "transforms/tables"
require_relative "transforms/task_lists"
require_relative "transforms/code_blocks"
require_relative "icons"

module Jekyll
  module Content
    # Orchestrates post_convert HTML transforms on a single parse/serialize cycle.
    class Enhancer
      def initialize(site)
        @site = site
        @code_blocks = Transforms::CodeBlocks::Pipeline.new(site)
      end

      def enhance(html)
        return html if html.nil? || html.empty?

        frag = Nokogiri::HTML::DocumentFragment.parse(html)
        Transforms::Tables.apply!(frag)
        Transforms::TaskLists.apply!(frag, @site)
        @code_blocks.apply!(frag)
        frag.to_html
      end
    end
  end
end
