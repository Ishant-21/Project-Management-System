import { useSelector } from "react-redux";

/**
 * Access to the server's message catalog.
 *
 * `msg("SOME_KEY")` returns the server's text, or "" while the catalog is still
 * loading / if the key is unknown. Returning "" rather than a local fallback is
 * deliberate: a `title=""` simply renders no tooltip, and it keeps message text
 * from creeping back into the client.
 */
export default function useMessages() {
  const catalog = useSelector((state) => state.messages.catalog);

  return {
    catalog,
    msg: (key) => catalog[key] || "",
  };
}
