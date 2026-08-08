# frozen_string_literal: true

require "nokogiri"

module Jekyll
  module Content
    # Local Lucide icons under assets/images/icon/lucide (see _data/icons.yml).
    module Icons
      module_function

      def resolve_file(site, name)
        map = site.data.dig("icons", "icons") || {}
        key = name.to_s
        map[key] || map[key.to_sym] || key
      end

      def url(site, name)
        base = site.data.dig("icons", "base") || "/assets/images/icon/lucide"
        "#{base}/#{resolve_file(site, name)}.svg"
      end

      def path(site, name)
        file = resolve_file(site, name)
        File.join(site.source, "assets", "images", "icon", "lucide", "#{file}.svg")
      end

      def assert_exists!(site, name)
        p = path(site, name)
        return if File.file?(p)

        raise "Lucide icon missing: #{p} (name=#{name})"
      end

      # Mask span matching _includes/utils/icon.html (works with assets/scripts/lib/icons.js).
      def span_html(site, name, extra_class: nil)
        assert_exists!(site, name)
        classes = ["icon-lucide", extra_class].compact.join(" ").strip
        href = url(site, name)
        %(<span class="#{classes}" style="--icon: url('#{href}')" data-icon="#{name}" aria-hidden="true"></span>)
      end

      def append_span!(parent, site, name, extra_class: nil)
        frag = Nokogiri::HTML::DocumentFragment.parse(
          span_html(site, name, extra_class: extra_class)
        )
        parent.add_child(frag)
      end
    end
  end
end
