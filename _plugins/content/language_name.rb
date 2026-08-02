# frozen_string_literal: true

module Jekyll
  module Content
    # Display names for Rouge / fenced-code language ids.
    # Data: _data/language_aliases.yml
    module LanguageName
      module_function

      def resolve(site, lang)
        lang = lang.to_s.strip
        return "" if lang.empty?

        data = site.data["language_aliases"] || {}
        aliases = data["aliases"] || {}
        upcase_list = data["upcase"] || []

        return aliases[lang] if aliases.key?(lang)

        lower = lang.downcase
        return aliases[lower] if aliases.key?(lower)
        return lang.upcase if upcase_list.include?(lower)

        lang
      end
    end
  end
end
