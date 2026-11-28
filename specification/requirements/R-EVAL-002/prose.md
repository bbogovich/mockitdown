A block that only declares a view renders it, as Xcode's preview canvas would; this lets authors
paste a view struct without writing an extra call. Its required properties show their own names
(`title`), so the preview reads like a template rather than failing.
