export default function Greet() {
  const storedUser = sessionStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const usernameRaw = parsedUser?.user?.Username ?? "User";
  const username = usernameRaw.charAt(0).toUpperCase() + usernameRaw.slice(1);

  return (
    <>
      <h1 className="text-4xl font-extrabold">Hello {username},</h1>
      <p className="text-[#848484] font-bold">This is what we've got for you today.</p>
    </>
  );
}
