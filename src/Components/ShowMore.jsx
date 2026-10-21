import { pluralize } from "../Theme/display";
import { Button } from "./Controls";

// Under a long list (paged with useShowMore()): "Showing 20 of 312 notices"
// and a button for the next page
const ShowMore = ({ shown, total, noun, pageSize, onMore }) => (
  <div className="mt-6 flex flex-col items-center gap-3">
    <p className="text-sm text-muted tabular-nums">
      Showing {Math.min(shown, total)} of {pluralize(total, noun)}
    </p>
    {shown < total && <Button onClick={onMore}>Show {Math.min(pageSize, total - shown)} more</Button>}
  </div>
);
export default ShowMore;
