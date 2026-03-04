// Apresentação de dados - Preview example em:
// https://www.shadcnblocks.com/block/experience1

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Experience1Props {
  className?: string;
}

const Experience = ({ className }: Experience1Props) => {
  const experience = [
    {
      period: 'Sep 2025 - Now',
      title: 'Sr. Software Engineer',
      description: 'Leading development of scalable web applications using React, TypeScript, and Node.js. Mentoring junior developers and implementing best practices.',
      company: 'Google',
    },
    {
      period: 'Mar 2023 - Aug 2025',
      title: 'Full Stack Developer',
      description: 'Built and maintained multiple client websites and e-commerce platforms. Collaborated with design teams to implement pixel-perfect UI/UX designs.',
      company: 'Microsoft',
    },
    {
      period: 'Jan 2021 - Feb 2023',
      title: 'Frontend Developer',
      description: 'Developed responsive web applications using modern JavaScript frameworks. Optimized performance and accessibility across multiple projects.',
      company: 'Apple',
    },
    {
      period: 'Jun 2019 - Dec 2020',
      title: 'Junior Developer',
      description: 'Assisted in building web applications and learning modern development practices. Contributed to team projects and code reviews.',
      company: 'Netflix',
    },
  ];

  return (
    <section className={cn('py-32', className)}>
      <div className="container space-y-10 lg:space-y-20">
        <div className="flex w-full items-end justify-between">
          <h1 className="font-semibold text-5xl tracking-tighter lg:text-6xl">Experience</h1>
          <Button variant="ghost" size="lg" className="font-semibold">
            Download CV <Download className="size-4" />
          </Button>
        </div>

        <ul>
          {experience.map((exp) => (
            <li key={`${exp.company}${exp.period}`} className="flex flex-col justify-between border-b py-10 md:flex-row">
              <div className="max-w-lg font-semibold text-xl tracking-tighter lg:w-1/3">{exp.period}</div>
              <div className="lg:w-1/3">
                <h2 className="mb-4 font-semibold text-2xl tracking-tighter">{exp.title}</h2>
                <p className="text-foreground/50">{exp.description}</p>
              </div>
              <div className="text-right lg:w-1/4">{exp.company}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export { Experience };
