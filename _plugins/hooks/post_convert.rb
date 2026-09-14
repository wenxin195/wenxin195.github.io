# frozen_string_literal: true

require_relative "../content/guard"
require_relative "../content/enhancer"
require_relative "../content/reading_time"
require_relative "../content/toc"

module Jekyll
  module Content
    # post_convert entry: HTML enhancement (Guard) and post reading-time (posts only).
    module PostConvert
      module_function

      def enhance!(doc)
        return unless Guard.enhancable?(doc)

        doc.content = enhancer_for(doc.site).enhance(doc.content) do |frag|
          Toc.assign!(doc, frag)
        end
      end

      def enhancer_for(site)
        enhancer = site.instance_variable_get(:@content_enhancer)
        return enhancer if enhancer

        site.instance_variable_set(:@content_enhancer, Enhancer.new(site))
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
