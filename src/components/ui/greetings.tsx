export default function Greet() {
  const storedUsername = localStorage.getItem("username") ?? "User";
  const username = storedUsername.charAt(0).toUpperCase() + storedUsername.slice(1);

  return (
    <>
      <h1 className="text-4xl font-extrabold">Hello {username},</h1>
      <p className="text-[#848484] font-bold">This is what we've got for you today.</p>
    </>
  );
}
