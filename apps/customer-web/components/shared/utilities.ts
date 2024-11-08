export function preventRouteWhenSubmitting(
  event: React.MouseEvent,
  isSubmitting: boolean
) {
  if (isSubmitting) {
    event.preventDefault();
  }
}

export function getUsernameInitials(text: string, numberOfInitials?: number) {
  const arr = text.split(' ').map((name) => name[0].toUpperCase());
  numberOfInitials = numberOfInitials || 2;
  if (arr.length < numberOfInitials) return arr.join('');
  return arr.slice(0, numberOfInitials).join('');
}
