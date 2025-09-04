import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import logo from "../assets/new_logo_small.png";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "@/types/formSchema";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { useLogin } from "@/features/api/auth/useLogin";
import { ErrorResponse, LoginResponse } from "@/service/api/auth/login";


export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    }
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    // Bypass with master credentials
    if (values.username === "john" && values.password === "john") {
      toast.success("Logged in with master credentials");
      window.sessionStorage.setItem("user", JSON.stringify({ user: { Username: values.username }, message: "Master login" }));
      navigate("/dashboard");
      return;
    }

    toast.promise(
      loginMutation.mutateAsync({
        role: values.username,
        username: values.username,
        password: values.password
      }),
      {
        loading: "Logging in",
        success: (data: LoginResponse) => {
          window.sessionStorage.setItem("user", JSON.stringify(data));
          navigate("/dashboard");
          return {
            message: data.message,
            description: `Welcome to BMS ${data.user.Username}`
          };
        },
        error: (error: ErrorResponse) => {
          console.log(error);
          return {
            message: "Login Failed",
            description: `${error.error}`
          };
        }
      }
    );
  }

  useEffect(() => {
    if (typeof invoke !== "function") {
      console.warn("⚠️ Tauri invoke not available (running in browser dev?)");
      return;
    }
    invoke("test_db_connection")
      .then((res) => {
        console.log("✅ DB test:", res);
      })
      .catch((err) => {
        console.error("❌ DB test error:", err);
      });
  }, []);

  return (
    <div className="min-w-screen min-h-screen bg-background flex flex-col items-center justify-center ">
      <Card className="w-full max-w-[41rem] h-[42rem] max-h-[47rem] py-[3rem]">
        <CardHeader className="space-y-4">
          <div className="w-[7rem] h-[7rem] mx-auto flex items-center justify-center">
            <img src={logo} alt="logo" width={120} />
          </div>
          <div className="mx-auto font-redhat text-center">
            <CardTitle className="text-2xl font-extrabold">Welcome Back!</CardTitle>
            <CardDescription className="text-md font-normal text-[#848484]">Enter the credentials to access BMS</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="px-[3rem] space-y-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="username" className="font-bold text-lg">Username</FormLabel>
                        <FormControl>
                          <Input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            required
                            className="h-[3rem]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="password" className="font-bold text-lg">Password</FormLabel>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter the password"
                            required
                            className="h-[3rem]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button className="w-full h-[3rem] mt-[1rem] font-bold text-lg">Sign In</Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="mx-auto font-light text-[#848484]">Keep the password secure and never share it to anyone.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
