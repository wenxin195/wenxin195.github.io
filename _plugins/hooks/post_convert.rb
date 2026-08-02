# frozen_string_literal: true

require_relative "../content/guard"
require_relative "../content/enhancer"
require_relative "../content/reading_time"

module Jekyll
  module Content
    # post_convert entry: HTML enhancement (Guard) and post reading-time (posts only).
    module PostConvert
      module_function

      def enhance!(doc)
        return unless Guard.enhancable?(doc)

        doc.content = Enhancer.new(doc.site).enhance(doc.content)
      end

      def assign_reading_time!(post)
        ReadingTime.assign!(post)
      end
    end
  end
end

Jekyll::Hooks.register :posts, :post_convert do |post|
  Jekyll::Content::PostConvert.enhance!(post)
  Jekyll::Content::PostConvert.assign_reading_time!(post)
end

Jekyll::Hooks.register :pages, :post_convert do |page|
  Jekyll::Content::PostConvert.enhance!(page)
end
