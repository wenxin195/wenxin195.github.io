# frozen_string_literal: true

module Jekyll
  class Document
    alias_method :compare_without_post_title, :<=>

    # Posts: date, then title, then path.
    # SiteDrop#posts reverses this, so lists are newest-first, title descending.
    def <=>(other)
      unless collection&.label == "posts" &&
             other.is_a?(Document) &&
             other.collection&.label == "posts"
        return compare_without_post_title(other)
      end

      return nil unless other.respond_to?(:data)

      cmp = data["date"] <=> other.data["date"]
      return cmp unless cmp.nil? || cmp.zero?

      cmp = data["title"].to_s <=> other.data["title"].to_s
      return cmp unless cmp.zero?

      path <=> other.path
    end
  end

  Hooks.register :site, :pre_render do |site, _payload|
    ordered_posts = site.posts.docs.sort { |left, right| right <=> left }
    post_order = ordered_posts.each_with_index.to_h { |post, index| [post.object_id, index] }

    site.pages.each do |page|
      next unless page.respond_to?(:pager) && page.pager

      page.pager.posts.sort_by! { |post| post_order.fetch(post.object_id, post_order.size) }
    end
  end
end
