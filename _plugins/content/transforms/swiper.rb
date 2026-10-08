# frozen_string_literal: true

module Jekyll
  module Content
    module Transforms
      # Convert Markdown image paragraphs inside {% swiper %} into slide elements.
      module Swiper
        module_function

        def apply!(frag)
          frag.css("[data-swiper-slides]").each do |wrapper|
            slides = wrapper.element_children.to_a
            if slides.empty?
              raise ArgumentError, "swiper requires at least one Markdown image"
            end

            slides.each do |paragraph|
              images = paragraph.css("img")
              unless paragraph.name == "p" && images.length == 1 && paragraph.text.strip.empty?
                raise ArgumentError,
                      "swiper accepts one Markdown image per paragraph; " \
                      "use {% swiper %}![Alt](/image.jpg){% endswiper %}"
              end

              slide = Nokogiri::XML::Node.new("div", wrapper.document)
              slide["class"] = "swiper__slide"
              images.first["data-lightbox-ignore"] = ""
              paragraph.children.to_a.each { |child| slide.add_child(child) }
              paragraph.replace(slide)
            end
          end
        end
      end
    end
  end
end
