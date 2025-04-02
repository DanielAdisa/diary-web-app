import Link from "next/link";
import { 
  RiGithubLine, 
  RiTwitterXLine, 
  RiGlobeLine,
  RiHeartPulseLine
} from "react-icons/ri";

export default function Footer() {
  return (
    <footer className="relative py-8 mt-16 overflow-hidden border-t border-border/30">
      {/* Background elements */}
      <div className="absolute inset-0 grid-pattern opacity-5 pointer-events-none"></div>
      
      <div className="container flex flex-col items-center justify-between gap-4 mx-auto text-center md:text-left md:flex-row">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center mb-2">
            <RiHeartPulseLine className="mr-2 text-primary" size={18} />
            <span className="font-medium">Memoir</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
        
        <div className="flex items-center space-x-1">
          <Link 
            href="https://daniel-port-sept.vercel.app/"
            className="flex items-center px-3 py-2 text-sm transition-colors rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/5"
          >
            <RiGlobeLine className="mr-2" size={16} />
            Built by Adisa Made It
          </Link>
          
          <div className="flex gap-1 ml-2">
            <Link 
              href="#"
              className="p-2 transition-colors rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-foreground"
              aria-label="GitHub"
            >
              <RiGithubLine size={18} />
            </Link>
            <Link 
              href="#"
              className="p-2 transition-colors rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-foreground"
              aria-label="Twitter"
            >
              <RiTwitterXLine size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
