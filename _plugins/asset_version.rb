# frozen_string_literal: true

require "digest"

module Jekyll
  # All ESM dependencies live in one immutable URL namespace per build. Relative
  # imports stay inside it; old HTML cannot silently mix cached module versions.
  class VersionedScript < StaticFile
    def initialize(site, relative, version)
      super(site, site.source, "assets/scripts", relative)
      @versioned_path = "assets/scripts/v-#{version}/#{relative}"
    end

    def destination(dest)
      File.join(dest, @versioned_path)
    end

    def relative_path
      "/#{@versioned_path}"
    end
  end

  class AssetVersion < Generator
    safe true
    priority :low

    def generate(site)
      scripts = Dir.glob(File.join(site.source, "assets/scripts/**/*.js")).sort
      styles = Dir.glob(File.join(site.source, "{_sass,assets/css}/**/*.scss")).sort
      digest = Digest::SHA256.new
      (scripts + styles).each { |file| digest << file.delete_prefix(site.source) << File.binread(file) }
      version = digest.hexdigest[0, 16]
      site.data["asset_version"] = version
      site.data["script_base"] = "/assets/scripts/v-#{version}/"
      scripts.each do |file|
        relative = file.delete_prefix(File.join(site.source, "assets/scripts") + "/")
        site.static_files << VersionedScript.new(site, relative, version)
      end
    end
  end
end
