import { motion } from 'framer-motion';

interface SectionHeadingProps {
    title: string;
    subtitle?: string;
    centered?: boolean;
}
export function SectionHeading({
    title,
    subtitle,
    centered = true
}: SectionHeadingProps) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 20
            }}
            whileInView={{
                opacity: 1,
                y: 0
            }}
            viewport={{
                once: true
            }}
            transition={{
                duration: 0.5
            }}
            className={`mb-12 ${centered ? 'text-center' : ''}`}>

            <h2 className="text-3xl md:text-4xl font-bold text-navy-600 dark:text-white mb-4 relative inline-block">
                {title}
                <span
                    className={`absolute -bottom-2 h-1 bg-accent rounded-full ${centered ? 'left-1/4 w-1/2' : 'left-0 w-1/2'}`}>
        </span>
            </h2>
            {subtitle &&
                <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto text-lg">
                    {subtitle}
                </p>
            }
        </motion.div>);

}