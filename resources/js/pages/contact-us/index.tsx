import classes from './contact-us.module.css';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm, usePage } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';

const ContactUsPage = () => {
    const { success } = usePage().props as { success?: string };

    useEffect(() => {
        document.body.classList.add('contact-us-page-body');

        // Cleanup function to remove the class when the component unmounts
        return () => {
            document.body.classList.remove('contact-us-page-body');
        };
    }, []); // Empty dependency array ensures this runs only once on mount and unmount

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: '',
        subject: '',
        email: '',
        message: '',
        phone: '',
    });

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(route('contact-us.store'), {
            preserveScroll: true,
        });
    }

    if (success) {
        return (
            <>
                <div className={classes['content-wrapper'] + ' inline-flex flex-col items-center justify-center self-center text-center'}>
                    <h2 className="mb-4 text-3xl dark:text-white">Thank you for contacting us</h2>
                    <p className="dark:text-white">{success}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className={`${classes['content-wrapper']} `}>
                <h2 className="mb-4 text-3xl dark:text-white">Contact Us</h2>
                <form onSubmit={handleSubmit} className={classes['form-control']}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="">
                            <label className={`${classes['form-field-label']} ${classes.label}`} htmlFor="name">
                                Name:
                            </label>
                            <Input
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value);
                                    clearErrors('name');
                                }}
                                className={` ${classes.name}`}
                                id="name"
                                type="text"
                                placeholder="Your name"
                            />
                            {errors.name && <p className={classes.error}>{`${errors.name}`}</p>}
                        </div>
                        <div className="">
                            <label className={`${classes['form-field-label']} ${classes.label}`} htmlFor="email">
                                Email:
                            </label>
                            <Input
                                value={data.email}
                                onChange={(e) => {
                                    setData('email', e.target.value);
                                    clearErrors('email');
                                }}
                                className={`${classes.email}`}
                                id="email"
                                type="email"
                                placeholder="Your email address"
                            />
                            {errors.email && <p className={classes.error}>{`${errors.email}`}</p>}
                        </div>
                        <div className="">
                            <label className={`${classes['form-field-label']} ${classes.label}`} htmlFor="phone">
                                Phone:
                            </label>
                            <Input
                                value={data.phone}
                                onChange={(e) => {
                                    setData('phone', e.target.value);
                                    clearErrors('phone');
                                }}
                                className={`${classes.name}`}
                                id="phone"
                                type="text"
                                placeholder="Phone"
                            />
                            {errors.phone && <p className={classes.error}>{`${errors.phone}`}</p>}
                        </div>
                        <div className="">
                            <label className={`${classes['form-field-label']} ${classes.label}`} htmlFor="subject">
                                Subject:
                            </label>
                            <Input
                                value={data.subject}
                                onChange={(e) => {
                                    setData('subject', e.target.value);
                                    clearErrors('subject');
                                }}
                                className={`${classes.email}`}
                                id="subject"
                                type="text"
                                placeholder="Subject"
                            />
                            {errors.subject && <p className={classes.error}>{`${errors.subject}`}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className={`${classes['form-field-label']} ${classes.label}`} htmlFor="message">
                                Message:
                            </label>
                            <Textarea
                                value={data.message}
                                onChange={(e) => {
                                    setData('message', e.target.value);
                                    clearErrors('message');
                                }}
                                className={`${classes.email}`}
                                cols={40}
                                rows={10}
                                id="message"
                                placeholder="Message"
                            />
                            {errors.message && <p className={classes.error}>{`${errors.message}`}</p>}
                        </div>
                        <div className="col-span-2">
                            <Button type="submit" className={classes.contact_button} disabled={processing}>
                                {processing ? 'Sending...' : 'Send Message'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ContactUsPage;
