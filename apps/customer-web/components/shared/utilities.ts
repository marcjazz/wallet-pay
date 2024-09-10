export function preventRouteWhenSubmitting(
  event: React.MouseEvent,
  isSubmitting: boolean
) {
  if (isSubmitting) {
    event.preventDefault();
  }
}
