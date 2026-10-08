# frozen_string_literal: true

module Jekyll
  module Swiper
    # {% swiper %}![Alt](/image.jpg){% endswiper %}
    # Markdown images inside the block become individual slides post-conversion.
    class SwiperBlock < Liquid::Block
      def render(_context)
        content = super.to_s
        if content.strip.empty?
          raise ArgumentError, "swiper requires at least one Markdown image"
        end

        <<~HTML
          <div class="swiper swiper--images swiper--lightbox-controls js-swiper" data-swiper-block>
            <div class="swiper__wrapper" data-swiper-slides markdown="1">
              #{content}
            </div>
            <button class="swiper__button swiper__button--prev" type="button" aria-label="上一张"></button>
            <button class="swiper__button swiper__button--next" type="button" aria-label="下一张"></button>
          </div>
        HTML
      end
    end
  end
end

Liquid::Template.register_tag("swiper", Jekyll::Swiper::SwiperBlock)
