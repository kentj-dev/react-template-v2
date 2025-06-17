<!DOCTYPE html>
<html>

<head>
    <title>Certificate of Compliance</title>
    <style>
        @page {
            margin: 180px 84px 100px 84px;
            /* top right bottom left */
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            background: #fff;
        }

        header {
            position: fixed;
            top: -120px;
            left: 0;
            right: 0;
            height: 150px;
            text-align: center;
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .header-img {
            max-width: 350px;
            height: auto;
            margin-bottom: 5px;
            margin-right: 20px;
        }

        .bp-img {
            max-width: 120px;
            height: auto;
            margin-bottom: 5px;
        }

        footer {
            position: fixed;
            bottom: -90px;
            left: 0px;
            right: 0px;
            height: 60px;
            font-size: 10pt;
            text-align: center;
            border-top: 2px solid #000;
            padding-top: 6px;
            background: #fff;
        }

        .content {
            font-size: 11pt;
        }

        .mb {
            margin-bottom: 1rem;
        }

        .long-mb {
            margin-bottom: 3rem;
        }

        .justify {
            text-align: justify;
        }

        .page-number:before {
            content: "Page " counter(page);
        }

        .basic-info-table td {
            vertical-align: top;
        }
    </style>
</head>

<body>
    <header>
        <img src="{{ public_path() }}/chedro12-header.png" alt="CHEDRO12 Header" class="header-img">
        <img src="{{ public_path() }}/bp-logo-min.png" alt="Bagong Pilipinas Logo" class="bp-img">
    </header>

    <footer>
        Prime Regional Center, Barangay Carpenter Hill, City of Koronadal, South Cotabato<br>
        Web Site: <a href="http://www.chedro12.com"
            style="color:#0074d9; text-decoration: underline;">www.chedro12.com</a>
        Tel No. 083 228 1130 &bull; <span class="page-number"></span>
    </footer>

    <main>
        <div class="content">
            <div class="mb">
                {{ \Carbon\Carbon::parse($submission->released_at)->format('F j, Y') }}
            </div>
            <div>
                <b>{{ strtoupper($submission->president_name) }}</b>
            </div>
            <div>
                President
            </div>
            <div>
                {{ ucfirst($submission->hei_name) }}
            </div>
            <div class="mb">
                {{ $submission->address }}
            </div>
            <div class="mb">
                {{-- Dear President {{ $submission->president_name }}, --}}
                Ma'am / Sir:
            </div>
            <div class="mb justify">
                This is to acknowledge receipt of the communication regarding the conduct of local off-campus activity
                with the following details below:
            </div>

            <div class="mb">
                <table width="100%" border="1" cellspacing="0" cellpadding="4"
                    style="border-collapse: collapse; font-size: 9pt;" class="basic-info-table">
                    <thead style="background: #f9f9f9;">
                        <tr>
                            <th style="text-align: start">Program Name</th>
                            <th>Activity Name / Course</th>
                            <th style="text-align: start">Destination/s & Venue</th>
                            <th style="text-align: start">Inclusive Dates</th>
                            <th>Number of Students</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($submission->basicInformations as $info)
                            <tr>
                                <td>
                                    @foreach (explode(',', $info->program_name) as $program)
                                        {{ trim($program) }}<br>
                                    @endforeach
                                </td>
                                <td style="text-align: center">
                                    @foreach (explode(',', $info->course) as $course)
                                        {{ trim($course) }}<br>
                                    @endforeach
                                </td>
                                <td>
                                    @if ($info->destinations && count($info->destinations))
                                        @foreach ($info->destinations as $dest)
                                            {{ $dest->destination_name }}<br>
                                        @endforeach
                                    @endif
                                </td>
                                <td>
                                    @if ($info->start_date && $info->end_date)
                                        {{ \Carbon\Carbon::parse($info->start_date)->format('F j, Y') }}
                                        @if ($info->end_date != $info->start_date)
                                            - {{ \Carbon\Carbon::parse($info->end_date)->format('F j, Y') }}
                                        @endif
                                    @endif
                                </td>
                                <td style="text-align:center;">{{ $info->students_number }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            @php
                $allComplied = $submission->is_autonomous
                    ? true
                    : $submission->activityReports->every(fn($ar) => $ar->status === 'complied');

                $allDocumentsComplied =
                    $submission->annex_a_status === 'complied' &&
                    ($submission->is_autonomous || $allComplied) &&
                    (!$submission->is_level_2_accredited ||
                        ($submission->is_level_2_accredited &&
                            $submission->program_accreditation_status === 'complied'));
            @endphp

            <div class="mb justify">
                The basis for the evaluation of documents is CMO No. 63, series of 2017, on the policies and guidelines
                on local off-campus activities and CMO No. 1, s. 2023, on the amendment to article IV.E of CHED
                Memorandum Order No. 9, series of 2022, on local off-campus activities.

                @if ($allDocumentsComplied)
                    After evaluation of the submitted documents, the Commission interposes no objection to the conduct
                    of the activity mentioned above, as such:
                @else
                    After evaluation of the submitted documents, please refer to the following deficiencies found:
                @endif
            </div>


            <div class="mb" style="text-align:center;">
                <table border="1" cellspacing="0" cellpadding="4"
                    style="border-collapse: collapse; font-size: 9pt; margin: 0 auto; width: 75%;">
                    <thead style="background: #f9f9f9;">
                        <tr>
                            <th>
                                Document Required
                            </th>
                            <th width="20%">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding-left: 30px;">1. Certificate of Compliance, Annex A</td>
                            <td>
                                <center>
                                    {{ $submission->annex_a_status === 'complied' ? 'Complied' : 'Not Complied' }}
                                </center>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-left: 30px;">2. Report of Compliance, Annex B</td>
                            <td>
                                <center>
                                    {{ $submission->is_autonomous ? 'Complied' : ($allComplied ? 'Complied' : 'Not Complied') }}
                                </center>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-left: 30px;">3. Other Documents</td>
                            <td>
                                <center>
                                    {{ $submission->is_autonomous ? 'With Documents' : ($allComplied ? 'With Documents' : 'Not Complied') }}
                                </center>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-left: 30px;">4. Copy of Program Accreditation (Level II and up) or
                                Autonomous/Deregulated Status
                            </td>
                            <td>
                                <center>
                                    {{ !$submission->is_level_2_accredited
                                        ? 'N/A'
                                        : ($submission->program_accreditation_status === 'complied'
                                            ? 'Complied'
                                            : 'Not Complied') }}
                                </center>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="mb justify">
                The Commission continues to encourage HEIs in their efforts and initiatives to broaden the
                student&apos;s
                learning opportunities aligned to the program and follow the pertinent provisions of issued policies,
                guidelines, and procedures.
            </div>
            <div class="long-mb">
                Very truly yours,
            </div>
            <div>
                <b>
                    RODY P. GARCIA, MDM, JD, Ed.D.
                </b>
            </div>
            <div class="mb">
                Regional Director
            </div>
            <br>
            @unless ($user?->hasAdminRole() && $is_temp === false)
                <div>
                    Note: Advance copy only. Not valid until officially signed.
                </div>
            @endunless

            <div style="font-size: 8pt;">
                CN: {{ $submission->control_number }}
            </div>
        </div>
    </main>
</body>

</html>
