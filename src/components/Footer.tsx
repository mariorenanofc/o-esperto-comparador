import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, type Variants, type Easing } from "framer-motion";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Heart,
  ShoppingCart,
  TrendingUp,
  Bell,
  ListChecks,
  Trophy,
  FileText,
  Shield
} from "lucide-react";

const easeOut: Easing = [0.16, 1, 0.3, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
};

const socialVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easeOut,
    },
  },
};

const bottomBarVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.5,
      ease: easeOut,
    },
  },
};

const Footer: React.FC = () => {
  const location = useLocation();
  
  // Don't show footer on admin pages or login pages
  const hideFooterPaths = ['/admin', '/login', '/signup', '/signin', '/sign-in'];
  const shouldHideFooter = hideFooterPaths.some(path => location.pathname.startsWith(path));
  
  if (shouldHideFooter) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  const mainLinks = [
    { to: "/comparison", label: "Comparar Preços", icon: ShoppingCart },
    { to: "/products", label: "Catálogo", icon: TrendingUp },
    { to: "/contribute", label: "Contribuir", icon: Heart },
    { to: "/economy", label: "Economia", icon: TrendingUp },
  ];

  const toolLinks = [
    { to: "/alerts", label: "Alertas de Preço", icon: Bell },
    { to: "/smart-list", label: "Lista Inteligente", icon: ListChecks },
    { to: "/gamification", label: "Ranking", icon: Trophy },
    { to: "/reports", label: "Relatórios", icon: FileText },
  ];

  const legalLinks = [
    { to: "/terms", label: "Termos de Uso" },
    { to: "/privacy", label: "Privacidade" },
    { to: "/plans", label: "Planos" },
    { to: "/api-docs", label: "API" },
  ];

  const socialLinks = [
    { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
    { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
    { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
    { href: "mailto:contato@oespertocomparador.com", icon: Mail, label: "Email" },
  ];

  return (
    <footer className="relative mt-auto">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 dark:from-primary/5 dark:via-accent/5 dark:to-secondary/5" />
      
      {/* Main Footer Content */}
      <div className="relative border-t border-border/50">
        <div className="container mx-auto px-4 py-12">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Brand Section */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  aria-hidden="true"
                >
                  <ShoppingCart className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">O Esperto</h3>
                  <p className="text-xs text-muted-foreground">Comparador</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compare preços, economize dinheiro e tome decisões inteligentes nas suas compras do dia a dia.
              </p>
              
              {/* Social Links */}
              <motion.div 
                className="flex items-center gap-3 pt-2"
                variants={containerVariants}
              >
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-colors group"
                    aria-label={social.label}
                    variants={socialVariants}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>

            {/* Navigation Links */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" aria-hidden="true" />
                Navegação
              </h4>
              <ul className="space-y-2">
                {mainLinks.map((link, index) => (
                  <motion.li 
                    key={link.to}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <motion.span
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-2"
                      >
                        <link.icon className="w-3.5 h-3.5" aria-hidden="true" />
                        {link.label}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Tools Links */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" aria-hidden="true" />
                Ferramentas
              </h4>
              <ul className="space-y-2">
                {toolLinks.map((link, index) => (
                  <motion.li 
                    key={link.to}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                  >
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <motion.span
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-2"
                      >
                        <link.icon className="w-3.5 h-3.5" aria-hidden="true" />
                        {link.label}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Legal & Info */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" aria-hidden="true" />
                Informações
              </h4>
              <ul className="space-y-2">
                {legalLinks.map((link, index) => (
                  <motion.li 
                    key={link.to}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <motion.span whileHover={{ x: 3 }} className="inline-block">
                        {link.label}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              
              {/* Newsletter hint */}
              <motion.div 
                className="pt-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-xs text-muted-foreground">
                  Ative as notificações para receber ofertas exclusivas na sua região!
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-border/30"
          variants={bottomBarVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <p>
                © {currentYear} O Esperto Comparador. Todos os direitos reservados.
              </p>
              <motion.p 
                className="flex items-center gap-1"
                whileHover={{ scale: 1.02 }}
              >
                Feito com{" "}
                <motion.span
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                >
                  <Heart className="w-3 h-3 text-destructive fill-current" />
                </motion.span>{" "}
                no Brasil
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
