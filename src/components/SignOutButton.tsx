import { signOut } from "@/../auth";

/**
 * A client component that renders a button to sign the user out.
 */
export default function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button type="submit" className="p-2 bg-red-500 text-white rounded">Sign Out</button>
    </form>
  );
}
