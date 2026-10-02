# frozen_string_literal: true

require "bibtex"
require "cgi"

module Jekyll
  module Bibliography
    # Site-wide BibTeX library. Entries follow GB/T 7714-2025 author-date.
    class Library
      PATH = "_bibliography/references.bib"

      def self.for(site)
        cached = site.instance_variable_get(:@bibliography_library)
        return cached if cached

        path = File.expand_path(PATH, site.source)
        library = new(BibTeX.open(path))
        site.instance_variable_set(:@bibliography_library, library)
        library
      end

      def self.parse(source)
        new(BibTeX.parse(source))
      end

      def initialize(bibliography)
        @bibliography = bibliography
      end

      def [](key)
        entry = @bibliography[key.to_s]
        entry.is_a?(BibTeX::Entry) ? entry : nil
      end
    end

    # GB/T 7714-2025 author-date. Chapter 8 keeps its templates. Section 8.1
    # moves 出版年 (7.5.1, 7.5.4.1) to immediately after the creator.
    module Format
      TEMPLATES = {
        "book" => :book,
        "booklet" => :book,
        "manual" => :book,
        "inbook" => :component,
        "incollection" => :component,
        "proceedings" => :proceedings,
        "inproceedings" => :paper,
        "conference" => :paper,
        "article" => :article,
        "periodical" => :serial,
        "phdthesis" => :thesis,
        "mastersthesis" => :thesis,
        "thesis" => :thesis,
        "techreport" => :report,
        "report" => :report,
        "standard" => :standard,
        "patent" => :patent,
        "online" => :webpage,
        "electronic" => :webpage,
        "webpage" => :webpage,
        "website" => :website,
        "archive" => :archive,
        "map" => :map,
        "dataset" => :dataset,
        "unpublished" => :preprint,
        "preprint" => :preprint,
        "software" => :program,
        "database" => :database,
        "collection" => :collection,
        "misc" => :misc
      }.freeze

      # Appendix A.1. A degree label such as "Ph.D." is not a type code.
      CODES = {
        "m" => "M", "j" => "J", "n" => "N", "c" => "C", "d" => "D", "r" => "R",
        "s" => "S", "p" => "P", "eb" => "EB", "a" => "A", "cm" => "CM", "ds" => "DS",
        "pp" => "PP", "g" => "G", "cp" => "CP", "db" => "DB", "z" => "Z",
        "newspaper" => "N", "standard" => "S", "patent" => "P", "archive" => "A",
        "map" => "CM", "dataset" => "DS", "preprint" => "PP", "software" => "CP",
        "database" => "DB", "webpage" => "EB", "website" => "EB"
      }.freeze

      CARRIERS = %w[MT DK CD OL MM].freeze
      SCRIPT_RANK = { "zh" => 0, "ja" => 1, "west" => 2, "ru" => 3, "other" => 4 }.freeze

      module_function

      def cite_text(entry, form, suffix = nil)
        names = in_text_names(entry)
        year = suffixed(citation_year(entry), suffix)
        raise ArgumentError, "Entry #{entry.key} is missing year" if year.empty?

        case form.to_s
        when "text"
          chinese?(entry) ? "#{names}（#{year}）" : "#{names}(#{year})"
        when "year"
          chinese?(entry) ? "（#{year}）" : "(#{year})"
        else
          chinese?(entry) ? "（#{names}，#{year}）" : "(#{names}, #{year})"
        end
      end

      def cite_html(entry, form, locator = nil, suffix = nil)
        text = escape(cite_text(entry, form, suffix))
        loc = locator.to_s.strip
        return text if loc.empty?

        "#{text}<sup>#{escape(loc)}</sup>"
      end

      def reference_html(entry, suffix = nil)
        escape(render_entry(entry, suffix))
      end

      def sort_entries(entries)
        entries.sort_by { |entry|
          [
            SCRIPT_RANK.fetch(script_of(entry)),
            sort_name(entry),
            citation_year(entry),
            field(entry, :title),
            entry.key.to_s
          ]
        }
      end

      # 9.3.1.3: same in-text creator and same year are distinguished with a, b, c
      # in bibliography order.
      def year_suffixes(entries)
        groups = {}
        entries.each do |entry|
          key = [in_text_names(entry), citation_year(entry)]
          (groups[key] ||= []) << entry
        end
        suffixes = {}
        groups.each_value do |group|
          next if group.length < 2

          group.each_with_index do |entry, index|
            if index > 25
              raise ArgumentError,
                    "Too many works by #{in_text_names(entry)} in #{citation_year(entry)}"
            end
            suffixes[entry.key.to_s] = ("a".ord + index).chr
          end
        end
        suffixes
      end

      def render_entry(entry, suffix)
        case template_name(entry)
        when :book then render_book(entry, suffix, "M")
        when :proceedings then render_book(entry, suffix, "C")
        when :collection then render_book(entry, suffix, "G")
        when :component then render_component(entry, suffix)
        when :paper then render_paper(entry, suffix)
        when :article then render_article(entry, suffix)
        when :newspaper then render_newspaper(entry, suffix)
        when :serial then render_serial(entry, suffix)
        when :thesis then render_thesis(entry, suffix)
        when :report then render_report(entry, suffix)
        when :standard then render_standard(entry, suffix)
        when :patent then render_patent(entry, suffix)
        when :webpage, :website then render_web(entry, suffix, code: "EB")
        when :archive then render_archive(entry, suffix)
        when :map then render_map(entry, suffix)
        when :dataset then render_dataset(entry, suffix, "DS")
        when :preprint then render_preprint(entry, suffix)
        when :program then render_program(entry, suffix)
        when :database then render_database(entry, suffix)
        when :misc then render_misc(entry, suffix)
        else
          raise ArgumentError,
                "Unsupported bibliography type #{entry.type.inspect} for #{entry.key}"
        end
      end

      def template_name(entry)
        type = entry.type.to_s
        return :newspaper if code_override(entry) == "N" && %w[article misc].include?(type)

        TEMPLATES.fetch(type) do
          raise ArgumentError,
                "Unsupported bibliography type #{type.inspect} for #{entry.key}"
        end
      end

      def render_book(entry, suffix, code)
        join_parts([
          creator_prefix(entry, suffix, move_year: true),
          "#{work_title(entry)}#{type_mark(entry, code)}",
          responsibilities(entry),
          edition_label(entry),
          publication(entry),
          *access_parts(entry)
        ])
      end

      def render_component(entry, suffix)
        # 8.3 puts the component's other creators before // and the host creator after it.
        translator = role_label(entry, :translator)
        others = translator.empty? ? "" : "#{translator}, #{chinese?(entry) ? "译" : "trans."}"
        mark = type_mark(entry, "M")
        head = if others.empty?
          "#{work_title(entry)}#{mark}//#{host_label(entry, :booktitle)}"
        else
          "#{work_title(entry)}#{mark}. #{others}//#{host_label(entry, :booktitle)}"
        end
        join_parts([
          creator_prefix(entry, suffix, move_year: true),
          head,
          edition_label(entry),
          publication(entry),
          *access_parts(entry)
        ])
      end

      # 8.6.1: a paper issued as a book keeps the place and publisher.
      # 8.6.3: otherwise only the meeting name, meeting year, and pages.
      # The type code is [C]. "//" is the 6.2 mark before 会议名称.
      def render_paper(entry, suffix)
        meeting = host_label(entry, :booktitle)
        head = "#{work_title(entry)}#{type_mark(entry, "C")}//#{meeting}"
        published = !field(entry, :publisher).empty? || !field(entry, :address).empty?
        if published
          body = [head, publication(entry)]
        else
          pages = gb_pages(entry)
          body = [pages.empty? ? head : "#{head}, #{pages}"]
        end
        join_parts([creator_prefix(entry, suffix, move_year: true), *body, *access_parts(entry)])
      end

      def render_article(entry, suffix)
        journal = required(entry, :journal)
        volume = field(entry, :volume)
        number = field(entry, :number)
        issue = if !volume.empty? && !number.empty?
          "#{volume} (#{number})"
        elsif !volume.empty?
          volume
        elsif !number.empty?
          "(#{number})"
        else
          ""
        end
        body = issue.empty? ? journal : "#{journal}, #{issue}"
        pages = gb_pages(entry)
        body = "#{body}: #{pages}" unless pages.empty?
        join_parts([
          creator_prefix(entry, suffix, move_year: true),
          "#{work_title(entry)}#{type_mark(entry, "J")}",
          body,
          *access_parts(entry)
        ])
      end

      def render_newspaper(entry, suffix)
        date = raw_date(entry)
        date = citation_year(entry) if date.empty?
        issue = field(entry, :number)
        tail = issue.empty? ? date : "#{date} (#{issue})"
        join_parts([
          creator_prefix(entry, suffix, move_year: true),
          "#{work_title(entry)}#{type_mark(entry, "N")}",
          "#{required(entry, :journal)}, #{tail}",
          *access_parts(entry)
        ])
      end

      def render_serial(entry, suffix)
        volume = field(entry, :volume)
        number = field(entry, :number)
        issue = volume
        issue = "#{volume} (#{number})" unless volume.empty? || number.empty?
        issue = "(#{number})" if volume.empty? && !number.empty?
        numbering = [citation_year(entry), issue].reject(&:empty?).join(", ")
        place = [field(entry, :address), field(entry, :publisher)].reject(&:empty?).join(": ")
        join_parts([
          creator_prefix(entry, suffix, move_year: true),
          "#{work_title(entry)}#{type_mark(entry, "J")}",
          numbering,
          place,
          *access_parts(entry)
        ])
      end

      def render_thesis(entry, suffix)
        join_parts([
          creator_prefix(entry, suffix, move_year: true),
          "#{work_title(entry)}#{type_mark(entry, "D")}",
          granting(entry),
          *access_parts(entry)
        ])
      end

      def render_report(entry, suffix)
        number = field(entry, :number)
        title = work_title(entry)
        title = "#{title}: #{number}" unless number.empty?
        join_parts([
          creator_prefix(entry, suffix, move_year: false),
          "#{title}#{type_mark(entry, "R")}",
          dated_pages(entry),
          *access_parts(entry)
        ])
      end

      def render_standard(entry, _suffix)
        join_parts([
          "#{required(entry, :number)} #{required(entry, :title)}#{type_mark(entry, "S")}",
          *access_parts(entry)
        ])
      end

      def render_patent(entry, suffix)
        join_parts([
          creator_prefix(entry, suffix, move_year: false, require_author: true),
          "#{work_title(entry)}: #{required(entry, :number)}#{type_mark(entry, "P")}",
          dated_pages(entry),
          *access_parts(entry)
        ])
      end

      def render_web(entry, suffix, code:)
        created = raw_date(entry)
        cited = field(entry, :urldate)
        raise ArgumentError, "Entry #{entry.key} is missing urldate" if cited.empty?
        if field(entry, :url).empty? && field(entry, :doi).empty?
          raise ArgumentError, "Entry #{entry.key} is missing url"
        end

        dates = +""
        dates << "(#{created}) " unless created.empty?
        dates << "[#{cited}]"
        join_parts([
          creator_prefix(entry, suffix, move_year: false),
          "#{work_title(entry)}#{type_mark(entry, code)}",
          dates,
          *access_parts(entry)
        ])
      end

      def render_archive(entry, suffix)
        title = work_title(entry)
        number = field(entry, :number)
        title = "#{title}: #{number}" unless number.empty?
        holder = field(entry, :publisher)
        holder = field(entry, :institution) if holder.empty?
        place = [field(entry, :address), holder].reject(&:empty?).join(": ")
        issued = dated_pages(entry)
        locator = [place, issued].reject(&:empty?).join(", ")
        join_parts([
          creator_prefix(entry, suffix, move_year: false),
          "#{title}#{type_mark(entry, "A")}",
          locator,
          *access_parts(entry)
        ])
      end

      def render_map(entry, suffix)
        scale = field(entry, :scale)
        title = work_title(entry)
        head = scale.empty? ? title : "#{title}. #{scale}"
        mark = type_mark(entry, "CM")
        head = if field(entry, :booktitle).empty?
          "#{head}#{mark}"
        else
          "#{head}#{mark}//#{host_label(entry, :booktitle)}"
        end
        join_parts([
          creator_prefix(entry, suffix, move_year: true),
          head,
          edition_label(entry),
          publication(entry),
          field(entry, :size),
          *access_parts(entry)
        ])
      end

      def render_dataset(entry, suffix, code)
        cited = field(entry, :urldate)
        raise ArgumentError, "Entry #{entry.key} is missing urldate" if cited.empty?

        released = raw_date(entry)
        platform = field(entry, :publisher)
        stamp = if platform.empty?
          "[#{cited}]"
        elsif released.empty?
          "#{platform} [#{cited}]"
        else
          "#{platform} (#{released}) [#{cited}]"
        end
        join_parts([
          creator_prefix(entry, suffix, move_year: false),
          "#{work_title(entry)}#{type_mark(entry, code)}",
          edition_label(entry),
          stamp,
          *access_parts(entry)
        ])
      end

      def render_preprint(entry, suffix)
        cited = field(entry, :urldate)
        raise ArgumentError, "Entry #{entry.key} is missing urldate" if cited.empty?
        if field(entry, :url).empty? && field(entry, :doi).empty?
          raise ArgumentError, "Entry #{entry.key} is missing url"
        end

        created = raw_date(entry)
        platform = field(entry, :publisher)
        platform = field(entry, :journal) if platform.empty?
        stamp = +""
        stamp << "#{platform} " unless platform.empty?
        stamp << "(#{created}) " unless created.empty?
        stamp << "[#{cited}]"
        join_parts([
          creator_prefix(entry, suffix, move_year: false),
          "#{work_title(entry)}#{type_mark(entry, "PP")}",
          edition_label(entry),
          stamp.strip,
          *access_parts(entry)
        ])
      end

      def render_program(entry, suffix)
        if !field(entry, :urldate).empty?
          render_web(entry, suffix, code: "CP")
        elsif online?(entry) || !field(entry, :publisher).empty?
          render_book(entry, suffix, "CP")
        else
          join_parts([
            creator_prefix(entry, suffix, move_year: !citation_year(entry).empty?),
            "#{work_title(entry)}#{type_mark(entry, "CP")}"
          ])
        end
      end

      def render_database(entry, suffix)
        if !field(entry, :urldate).empty?
          render_dataset(entry, suffix, "DB")
        else
          render_book(entry, suffix, "DB")
        end
      end

      def render_misc(entry, suffix)
        code = code_override(entry)
        return render_web(entry, suffix, code: code || "EB") if !field(entry, :urldate).empty?
        return render_book(entry, suffix, code || "Z") if !citation_year(entry).empty?

        join_parts([
          creator_prefix(entry, suffix, move_year: false),
          "#{work_title(entry)}#{type_mark(entry, code || "Z")}",
          *access_parts(entry)
        ])
      end

      def creator_prefix(entry, suffix, move_year:, require_author: false)
        names = author_label(entry)
        raise ArgumentError, "Entry #{entry.key} is missing author" if names.nil? && require_author

        year = if move_year || !suffix.to_s.empty?
          suffixed(citation_year(entry), suffix).tap { |value|
            raise ArgumentError, "Entry #{entry.key} is missing year" if value.empty?
          }
        else
          ""
        end
        return year if names.nil?
        return names if year.empty?

        "#{names}, #{year}"
      end

      def publication(entry)
        place = [field(entry, :address), field(entry, :publisher)].reject(&:empty?).join(": ")
        pages = gb_pages(entry)
        return pages if place.empty?
        return place if pages.empty?

        # 8.1 example 1: after the year moves, pages stay behind a comma.
        "#{place}, #{pages}"
      end

      def granting(entry)
        school = field(entry, :school)
        school = field(entry, :institution) if school.empty?
        place = [field(entry, :address), school].reject(&:empty?).join(": ")
        pages = gb_pages(entry)
        return pages if place.empty?
        return place if pages.empty?

        # 8.1 example 5 keeps the colon before the cited pages.
        "#{place}: #{pages}"
      end

      def dated_pages(entry)
        date = raw_date(entry)
        date = field(entry, :year) if date.empty?
        pages = gb_pages(entry)
        return "#{date}: #{pages}" if !date.empty? && !pages.empty?
        return date unless date.empty?

        pages
      end

      def host_label(entry, title_field)
        title = required(entry, title_field)
        host = role_label(entry, :editor)
        host = role_label(entry, :bookauthor) if host.empty?
        host = field(entry, :organization) if host.empty?
        host.empty? ? title : "#{host}. #{title}"
      end

      def responsibilities(entry)
        zh = chinese?(entry)
        parts = []
        editor = role_label(entry, :editor)
        translator = role_label(entry, :translator)
        parts << "#{editor}, #{zh ? "编" : "ed."}" unless editor.empty?
        parts << "#{translator}, #{zh ? "译" : "trans."}" unless translator.empty?
        parts.join(". ")
      end

      def work_title(entry, name = :title)
        title = required(entry, name)
        subtitle = field(entry, :subtitle)
        subtitle.empty? ? title : "#{title}: #{subtitle}"
      end

      def type_mark(entry, code)
        code = code_override(entry) || code
        carrier = carrier_of(entry)
        token = carrier.empty? ? code : "#{code}/#{carrier}"
        "[#{token}]"
      end

      def code_override(entry)
        [field(entry, :entrysubtype), field(entry, :type)].each do |raw|
          code = CODES[raw.downcase]
          return code if code
        end
        nil
      end

      def carrier_of(entry)
        medium = field(entry, :medium).upcase
        return medium if CARRIERS.include?(medium)
        return "OL" if online?(entry)

        ""
      end

      def online?(entry)
        !field(entry, :url).empty? || !field(entry, :doi).empty?
      end

      def access_parts(entry)
        url = field(entry, :url)
        doi = field(entry, :doi).sub(%r{\Ahttps?://(?:dx\.)?doi\.org/}i, "")
        if url.empty? && !doi.empty?
          url = "https://doi.org/#{doi}"
          doi = ""
        elsif !doi.empty? && url.downcase.include?(doi.downcase)
          doi = ""
        end
        parts = []
        parts << url unless url.empty?
        parts << "DOI: #{doi}" unless doi.empty?
        parts
      end

      def join_parts(parts)
        parts.flatten.compact.map { |part| dot(part) }.reject(&:empty?).join(" ")
      end

      def dot(text)
        text = text.to_s.strip
        return "" if text.empty?

        text.match?(/[.。]\z/) ? text : "#{text}."
      end

      def suffixed(year, suffix)
        return "" if year.to_s.empty?
        return year if suffix.to_s.empty?

        "#{year}#{suffix}"
      end

      def citation_year(entry)
        year = field(entry, :year)
        return year unless year.empty?

        date = raw_date(entry)
        found = date[/\A\d{4}/]
        return found if found

        field(entry, :urldate)[/\A\d{4}/].to_s
      end

      def raw_date(entry)
        date = field(entry, :date)
        return date unless date.empty?

        month = field(entry, :month)
        year = field(entry, :year)
        return "" if month.empty? || year.empty?
        return month if month.match?(/\A\d{4}/)

        day = field(entry, :day)
        if month.match?(/\A\d{1,2}\z/)
          month = month.rjust(2, "0")
          return day.empty? ? "#{year}-#{month}" : "#{year}-#{month}-#{day.rjust(2, "0")}"
        end

        day.empty? ? "#{month} #{year}" : "#{month} #{day}, #{year}"
      end

      def gb_pages(entry)
        field(entry, :pages).tr("–—", "-")
      end

      def edition_label(entry)
        raw = field(entry, :edition)
        return "" if raw.empty?

        number = raw[/\d+/]
        return "" if number == "1" && !raw.match?(/rev|修订|新/i)
        return "#{number} 版" if chinese?(entry) && number
        return raw if chinese?(entry)
        return raw if raw.match?(/ed\.?\z/i)
        return "#{ordinal(number.to_i)} ed." if number

        raw
      end

      def ordinal(number)
        return "#{number}th" if (11..13).cover?(number % 100)

        case number % 10
        when 1 then "#{number}st"
        when 2 then "#{number}nd"
        when 3 then "#{number}rd"
        else "#{number}th"
        end
      end

      def author_label(entry)
        list = names_of(entry, :author)
        return nil if list.empty?

        format_people(list, chinese?(entry))
      end

      def role_label(entry, role)
        list = names_of(entry, role)
        return "" if list.empty?

        format_people(list, chinese?(entry))
      end

      def format_people(list, chinese)
        labels = list.map { |name| reference_name(name) }
        labels = labels.take(3) + [chinese ? "等" : "et al."] if labels.length > 3
        labels.join(", ")
      end

      def reference_name(name)
        if han_name?(name)
          return display_name(name, chinese: true)
        end

        full = display_name(name, chinese: false)
        initials = given_initials(name)
        suffix = name_part(name, :suffix).delete(".")
        full = "#{full} #{initials}" unless initials.empty?
        return "#{full} #{suffix}" unless suffix.empty?

        full
      end

      def in_text_names(entry)
        list = names_of(entry, :author)
        if list.empty?
          fallback = field(entry, :number)
          fallback = field(entry, :title) if fallback.empty?
          raise ArgumentError, "Entry #{entry.key} is missing author" if fallback.empty?

          return fallback
        end

        label = display_name(list.fetch(0), chinese: han_name?(list.fetch(0)))
        return label if list.length == 1

        # 9.3.1.2 follows the language of the work, not of a later coauthor.
        chinese?(entry) || han_name?(list.fetch(0)) ? "#{label} 等" : "#{label} et al."
      end

      def han_name?(name)
        [name_part(name, :last), name_part(name, :first), name_part(name, :prefix)].join.match?(/\p{Han}/)
      end

      def sort_name(entry)
        name = in_text_names(entry)
        script_of(entry) == "zh" || script_of(entry) == "ja" ? name : name.downcase
      end

      def script_of(entry)
        lang = field(entry, :language).downcase
        return "zh" if lang.start_with?("zh")
        return "ja" if lang.start_with?("ja")
        return "ru" if lang.start_with?("ru")
        return "west" if lang.match?(/\A(?:en|fr|de|es|pt|it|la|nl|sv|no|da|fi|pl|cs|hu|ro|tr)/)

        text = "#{author_label(entry)} #{field(entry, :title)}"
        return "ja" if text.match?(/\p{Hiragana}|\p{Katakana}/)
        return "zh" if text.match?(/\p{Han}/)
        return "ru" if text.match?(/\p{Cyrillic}/)
        return "west" if text.match?(/\p{Latin}/)

        "other"
      end

      def names_of(entry, role)
        value = entry[role]
        return [] if value.nil?
        return value.to_a if value.is_a?(BibTeX::Names)

        text = value.to_s.gsub(/[{}]/, "").strip
        return [] if text.empty?
        return value.to_a if value.respond_to?(:to_a) && value.to_a.all? { |item| item.is_a?(BibTeX::Name) }

        BibTeX::Names.parse(text).to_a
      rescue StandardError
        []
      end

      def display_name(name, chinese:)
        family = [name_part(name, :prefix), name_part(name, :last)].reject(&:empty?).join(" ")
        given = name_part(name, :first).delete(".")
        return "#{family}#{given}" if chinese

        family
      end

      def given_initials(name)
        name_part(name, :first).delete(".").split(/\s+/).reject(&:empty?).map { |part|
          part.split("-").reject(&:empty?).map { |piece| piece[0].upcase }.join("-")
        }.join(" ")
      end

      def name_part(name, part)
        value = name.public_send(part) if name.respond_to?(part)
        value.to_s.strip
      end

      def chinese?(entry)
        field(entry, :language).downcase.start_with?("zh")
      end

      def required(entry, name)
        value = field(entry, name)
        raise ArgumentError, "Entry #{entry.key} is missing #{name}" if value.empty?

        value
      end

      def field(entry, name)
        value = entry[name]
        return "" if value.nil?

        value.to_s.gsub(/[{}]/, "").gsub("---", "—").gsub("--", "–").gsub(/\s+/, " ").strip
      end

      def escape(text)
        CGI.escapeHTML(text.to_s)
      end
    end
  end
end
