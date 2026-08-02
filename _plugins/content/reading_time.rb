# frozen_string_literal: true

require "nokogiri"

module Jekyll
  module Content
    # Mixed CJK / English reading-time stats from plain text (HTML stripped).
    # Assigned to posts only from hooks/post_convert.rb.
    module ReadingTime
      CJK_PER_MINUTE = 400.0
      WORDS_PER_MINUTE = 200.0
      CJK_REGEX = /[\p{Han}\p{Hiragana}\p{Katakana}\p{Hangul}]/u

      module_function

      def compute(html_or_text)
        text = strip_to_text(html_or_text)
        char_count = text.size

        cjk_chars = text.scan(CJK_REGEX).size
        remainder = text.gsub(CJK_REGEX, " ")
        words = remainder.split.reject(&:empty?).size

        minutes = (cjk_chars / CJK_PER_MINUTE) + (words / WORDS_PER_MINUTE)
        reading_time = [1, minutes.ceil].max

        {
          "reading_time" => reading_time,
          "char_count" => char_count,
          "cjk_count" => cjk_chars,
          "word_count" => words
        }
      end

      def strip_to_text(input)
        str = input.to_s
        if str.include?("<")
          Nokogiri::HTML::DocumentFragment.parse(str).text
        else
          str
        end.gsub(/\s+/, " ").strip
      end

      def assign!(doc)
        stats = compute(doc.content)
        stats.each { |key, value| doc.data[key] = value }
      end
    end
  end
end
