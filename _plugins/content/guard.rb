# frozen_string_literal: true

module Jekyll
  module Content
    # Whether a document's converted body is safe to run HTML transforms on.
    # Exempt non-article Pages (e.g. assets/css/*.scss): Nokogiri would
    # HTML-escape ">" in CSS and break site-wide selectors.
    module Guard
      module_function

      NON_HTML_EXTNAMES = %w[.scss .sass .css .js .map .xml .txt .json].freeze

      def enhancable?(doc)
        path = doc.path.to_s.tr("\\", "/")
        return false if path.start_with?("assets/")
        return false unless doc.respond_to?(:output_ext) && doc.output_ext == ".html"
        return false if NON_HTML_EXTNAMES.include?(doc.extname)

        true
      end
    end
  end
end
