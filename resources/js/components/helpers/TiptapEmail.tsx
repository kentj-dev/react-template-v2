import { SharedData } from '@/types';
import { formatDateFull } from '@/utils/dateHelper';
import { useForm } from '@inertiajs/react';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    CircleAlert,
    Italic,
    List,
    ListOrdered,
    Mail,
    Send,
    Underline as UnderlineIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { ConfirmActionPopover } from './ConfirmActionPopover';

const extensions = [
    StarterKit.configure({
        bulletList: {
            keepMarks: true,
            keepAttributes: false,
        },
        orderedList: {
            keepMarks: true,
            keepAttributes: false,
        },
    }),
    Placeholder.configure({
        placeholder: 'Write something ...',
    }),
    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),
    Underline,
];

interface TiptapEmailProps {
    email: string;
    showEmailMaker?: boolean;
    setShowEmailMaker?: (show: boolean) => void;
    controlNumber: string;
}

type EmailForm = {
    email: string;
    title: string;
    content: string;
    attachments: File[] | null;
};

const TiptapEmail: React.FC<TiptapEmailProps> = ({ email, showEmailMaker, setShowEmailMaker, controlNumber }) => {
    const EMAIL_PRE_CONTENT = `
        <p>
            <b>Good day!</b>
        </p>
        <p>
        </p>
        <p>
            Thank you for submitting your Local Off-Campus application to CHED Regional Office XII.
        </p>
        <p>
        </p>
        <p>
            To view your submission status, please visit the link below <br>
            <a href="https://sas.chedro12.com/c/submission/${controlNumber}">
                https://sas.chedro12.com/c/submission/${controlNumber}
            </a>
        </p>
        <p>
        </p>
        <p>
            Thank you and we look forward to assisting you with your Local Off-Campus application.
        </p>
        <p>
        </p>
        <p>
            <i>Note: This email is system-generated, please do not reply to this email.</i> <br>
            <i>Kindly direct all concerns to chedro12@ched.gov.ph</i>
        </p>
    `;
    const editor = useEditor({
        extensions,
        content: `${EMAIL_PRE_CONTENT}`,
        autofocus: true,
        onUpdate: ({ editor }) => {
            const content = editor.getHTML();
            if (content.length > 0) {
                setData('content', content);
            }
        },
    });

    if (!editor) {
        return null;
    }

    const [sendEmailPopover, setSendEmailPopover] = useState(false);

    const { data, setData, reset, post, processing, errors } = useForm<EmailForm>({
        email: email,
        title: 'Local Off-Campus Application',
        content: EMAIL_PRE_CONTENT,
        attachments: null,
    });

    useEffect(() => {
        setData('email', email);
    }, [email]);

    const handleSendEmail = () => {
        const promise = new Promise<void>((resolve, reject) => {
            post(route('submission.a.send-email'), {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flash = (page.props as { flash?: SharedData['flash'] }).flash;

                    if (flash?.error) {
                        reject(flash.error);
                    } else {
                        resolve();
                    }

                    setShowEmailMaker?.(false);
                    reset();
                },
                onError: () => {
                    reject('An error occurred while sending the email. Please try again later.');
                },
            });
        });

        toast.promise(promise, {
            loading: `Sending email to ${email}...`,
            success: `Email sent successfully to ${email}!`,
            error: (message) => message,
            duration: 5000,
            description: formatDateFull(new Date()),
            descriptionClassName: '!text-gray-500',
            classNames: {
                success: '!text-green-700',
                error: '!text-red-700',
                loading: '!text-blue-700',
            },
        });
    };

    return (
        <Dialog open={showEmailMaker} onOpenChange={setShowEmailMaker}>
            <DialogContent className="flex h-full !max-w-[1000px] flex-col gap-2 overflow-auto md:h-[90%]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gray-600">
                        <Mail />
                        Compose Email
                    </DialogTitle>
                    <DialogDescription>You are sending as noreply@sas.chedro12.com</DialogDescription>
                </DialogHeader>
                <div className="flex h-full flex-col pt-4 md:h-[90%]">
                    <div className="mb-2">
                        <Label className="text-gray-600" htmlFor="send-to">
                            Send To
                        </Label>
                        <Input placeholder="Title ..." id="send-to" value={email} disabled className="disabled:opacity-100" />
                    </div>
                    <div className="mb-2">
                        <div className="mb-1 flex justify-between">
                            <Label className="text-gray-600" htmlFor="title">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            {errors.title && <span className="ms-auto text-xs text-red-500">{errors.title}</span>}
                        </div>
                        <Input placeholder="Title ..." id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                    </div>
                    <div>
                        <div className="mb-1 flex justify-between">
                            <span className="text-sm font-medium text-gray-600">
                                Content <span className="text-red-500">*</span>
                            </span>
                            {errors.content && <span className="ms-auto text-xs text-red-500">{errors.content}</span>}
                        </div>
                    </div>
                    {/* button group */}
                    <div className="flex items-center overflow-x-auto overflow-y-hidden rounded-t-lg border border-b-0">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            disabled={!editor.can().chain().focus().toggleBold().run()}
                            className={`cursor-pointer border-e p-3 py-4 transition-all`}
                        >
                            <Bold size={18} color={editor.isActive('bold') ? 'red' : '#242424'} className="transition-all" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            disabled={!editor.can().chain().focus().toggleItalic().run()}
                            className={`cursor-pointer border-e p-3 py-4 transition-all`}
                        >
                            <Italic size={18} color={editor.isActive('italic') ? 'red' : '#242424'} className="transition-all" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            disabled={!editor.can().chain().focus().toggleUnderline().run()}
                            className={`cursor-pointer border-e p-3 py-4 transition-all`}
                        >
                            <UnderlineIcon size={18} color={editor.isActive('underline') ? 'red' : '#242424'} className="transition-all" />
                        </button>

                        <Separator orientation="vertical" className="px-0.5" />

                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`cursor-pointer border-e p-3 py-4 transition-all`}
                        >
                            <List size={18} color={editor.isActive('bulletList') ? 'red' : '#242424'} className="transition-all" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={`cursor-pointer border-e p-3 py-4 transition-all`}
                        >
                            <ListOrdered size={18} color={editor.isActive('orderedList') ? 'red' : '#242424'} className="transition-all" />
                        </button>

                        <Separator orientation="vertical" className="px-0.5" />

                        <button
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            className={`cursor-pointer border-e p-3 py-4 transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
                            title="Align Left"
                        >
                            <AlignLeft size={18} color={editor.isActive({ textAlign: 'left' }) ? 'red' : '#242424'} className="transition-all" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            className={`cursor-pointer border-e p-3 py-4 transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
                            title="Align Center"
                        >
                            <AlignCenter size={18} color={editor.isActive({ textAlign: 'center' }) ? 'red' : '#242424'} className="transition-all" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            className={`cursor-pointer border-e p-3 py-4 transition-all ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
                            title="Align Right"
                        >
                            <AlignRight size={18} color={editor.isActive({ textAlign: 'right' }) ? 'red' : '#242424'} className="transition-all" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                            className={`cursor-pointer border-e p-3 py-4 transition-all ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}`}
                            title="Justify"
                        >
                            <AlignJustify
                                size={18}
                                color={editor.isActive({ textAlign: 'justify' }) ? 'red' : '#242424'}
                                className="transition-all"
                            />
                        </button>
                    </div>
                    {/* end of button group */}
                    <div
                        className="mb-2 h-full max-h-[75vh] cursor-text overflow-y-auto rounded-b-lg border p-2 shadow"
                        onClick={() => editor.chain().focus().run()}
                    >
                        <EditorContent editor={editor} id="tip-em-editor" />
                    </div>
                    <div>
                        <Label className="text-gray-600" htmlFor="attachments">
                            Attachments
                            {Object.entries(errors)
                                .filter(([key]) => key.startsWith('attachments'))
                                .map(([key, error], i) => (
                                    <div key={key} className="mt-1 text-xs text-red-500">
                                        {error}
                                    </div>
                                ))}
                        </Label>
                        <Input
                            type="file"
                            id="attachments"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="shadow"
                            onChange={(e) => {
                                setData('attachments', e.target.files ? Array.from(e.target.files) : null);
                            }}
                        />
                        {data.attachments &&
                            data.attachments.length > 0 &&
                            data.attachments.map((file, index) => (
                                <span key={index} className="text-xs text-gray-500">
                                    {file.name} ({(file.size / 1024).toFixed(2)} KB),&nbsp;
                                </span>
                            ))}
                    </div>
                </div>
                <DialogFooter className="!flex items-center !justify-between pt-2">
                    <div>
                        <span className="flex items-center gap-2 text-sm font-medium text-red-500">
                            <CircleAlert size={16} />
                            <span>Note: Please make sure to review the email content before sending it.</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button className="border-b-1" variant={'outline'} onClick={() => setShowEmailMaker?.(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <ConfirmActionPopover
                            modal
                            open={sendEmailPopover}
                            onOpenChange={setSendEmailPopover}
                            trigger={
                                <Button className="!border-b-1" variant="success" disabled={processing}>
                                    <Send />
                                    Send Email
                                </Button>
                            }
                            title="Confirm Email Sending"
                            description={
                                <>
                                    <b>You are about to send an email to the selected personnel in charge.</b>
                                    <ul className="mt-1 ml-6 list-disc text-left text-xs">
                                        <li>
                                            The email will be sent to: <span className="font-semibold text-blue-600">{email}</span>
                                        </li>
                                        <li>
                                            Please make sure the email content is complete and accurate. The message will include all formatting and
                                            attachments you have provided.
                                        </li>
                                        <li>Once sent, the recipient will be notified and able to view your message and any attached documents.</li>
                                        <li>Review all details before proceeding, as emails cannot be unsent.</li>
                                    </ul>
                                    <span className="mt-2 block font-medium text-red-600">Are you sure you want to send this email now?</span>
                                </>
                            }
                            confirmLabel="Yes, Send Email Now"
                            confirmIcon={<Send />}
                            onConfirm={handleSendEmail}
                            processing={processing}
                        />
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TiptapEmail;
